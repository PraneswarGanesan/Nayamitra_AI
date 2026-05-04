from typing import Dict, Any, List, Tuple, Optional
from core.schemas import GraphState, ActionPlan, DirectiveRecord, VerificationField, TextBlock, CaseSummary, CaseMetadataVerification, ConfidenceExplanation, LimitationData
from utils.limitation_engine import compute_limitation
from database.vector_db import search_precedents
import unicodedata
import re
import difflib

def normalize_text(text: str) -> str:
    # Normalize unicode (e.g. ellipses)
    text = unicodedata.normalize("NFKD", text)
    # Lowercase
    text = text.lower()
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_confidence_band(score: float) -> str:
    if score >= 0.85: return "HIGH"
    if score >= 0.50: return "MEDIUM"
    return "LOW"

def _find_source_block(source_text: str, parsed_blocks: List[TextBlock], field_type: str = "metadata") -> Tuple[Optional[TextBlock], float, ConfidenceExplanation, Optional[Dict[str, int]]]:
    if not source_text or not source_text.strip():
        exp = ConfidenceExplanation(match_type="missing", boost_type="none", base_similarity=0.0, grounding_mode="unanchored")
        return None, 0.0, exp, None
        
    if source_text.lower() == "not specified":
        exp = ConfidenceExplanation(match_type="absent", boost_type="none", base_similarity=1.0, grounding_mode="unanchored")
        return None, 0.85, exp, None
    
    norm_source = normalize_text(source_text)
    if len(norm_source) < 3: # Too short to reliably match anything
        exp = ConfidenceExplanation(match_type="missing", boost_type="none", base_similarity=0.0, grounding_mode="unanchored")
        return None, 0.0, exp, None
        
    best_match = None
    highest_ratio = 0.0
    best_boost_type = "none"
    best_anchor = None
    best_match_type = "missing"
    best_base_sim = 0.0
    best_grounding_mode = "unanchored"
    
    total_pages = max([b.page_num for b in parsed_blocks]) if parsed_blocks else 1
    
    # Meaningful substring check: > 15 chars and >= 2 tokens
    tokens = norm_source.split(' ')
    can_use_substring = len(norm_source) > 15 and len(tokens) >= 2
    
    for block in parsed_blocks:
        norm_block = normalize_text(block.text)
        if not norm_block:
            continue
            
        # Base similarity
        ratio = difflib.SequenceMatcher(None, norm_source, norm_block).ratio()
        base_sim = ratio
        match_type = "partial_match"
        boost_type = "none"
        grounding_mode = "fuzzy"
        anchor = None
        
        # Calculate anchor offset on NORMALIZED text so it doesn't fail on PyMuPDF spaces
        norm_block_clean = re.sub(r'\s+', ' ', block.text).strip().lower()
        norm_source_clean = re.sub(r'\s+', ' ', source_text).strip().lower()
        start_idx = norm_block_clean.find(norm_source_clean)
        if start_idx != -1:
            anchor = {"start": start_idx, "end": start_idx + len(norm_source_clean)}
        
        # Controlled substring logic
        if can_use_substring and norm_source in norm_block:
            match_type = "exact_match"
            grounding_mode = "verbatim"
            coverage = len(norm_source) / len(norm_block) if len(norm_block) > 0 else 0
            # Base valid substring is 0.80, scales up to 0.95 depending on coverage
            substring_ratio = 0.80 + (0.15 * coverage)
            if substring_ratio > ratio:
                ratio = substring_ratio
            base_sim = ratio # Update base_sim so UI doesn't see 0.83 for exact match
            
        # Contextual Position Weighting
        if ratio > 0.5: # Only boost if there is a decent baseline match
            if field_type == "metadata":
                # Top 30% of page 1 or 2. (Assume standard page height is ~800, so y0 < 250)
                if block.page_num <= 2 and block.bbox[1] < 250:
                    ratio += 0.10
                    boost_type = "header_boost"
            elif field_type == "directive":
                # Last 20% of the document pages
                threshold_page = max(1, int(total_pages * 0.8))
                if block.page_num >= threshold_page:
                    ratio += 0.10
                    boost_type = "directive_boost"
                    
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = block
            best_boost_type = boost_type
            best_anchor = anchor
            best_match_type = match_type
            best_base_sim = base_sim
            best_grounding_mode = grounding_mode
            
    # Absolute ceiling
    highest_ratio = min(0.95, highest_ratio)
            
    if highest_ratio > 0.4: # Threshold
        exp = ConfidenceExplanation(match_type=best_match_type, boost_type=best_boost_type, base_similarity=round(best_base_sim, 2), grounding_mode=best_grounding_mode)
        return best_match, round(highest_ratio, 2), exp, best_anchor
        
    # FALLBACK (Token Overlap)
    if field_type == "directive":
        source_tokens = set(tokens)
        keywords = {"dismissed", "allowed", "ordered", "directed", "disposed", "uphold", "quashed"}
        has_keyword = bool(source_tokens & keywords)
        
        if has_keyword:
            threshold_page = max(1, int(total_pages * 0.8))
            best_fallback_block = None
            best_overlap = 0.0
            
            for block in parsed_blocks:
                if block.page_num < threshold_page:
                    continue
                    
                norm_block = normalize_text(block.text)
                block_tokens = set(norm_block.split())
                if not block_tokens: continue
                
                overlap = len(source_tokens & block_tokens) / len(source_tokens)
                if overlap >= 0.70 and overlap > best_overlap:
                    best_overlap = overlap
                    best_fallback_block = block
                    
            if best_fallback_block:
                exp = ConfidenceExplanation(match_type="partial_match", boost_type="none", base_similarity=round(best_overlap, 2), grounding_mode="fallback")
                return best_fallback_block, 0.50, exp, None # Return 0.50 score, LOW band handled downstream
    
    # If all fails, return unanchored
    exp = ConfidenceExplanation(match_type="missing", boost_type="none", base_similarity=0.0, grounding_mode="unanchored")
    return None, 0.0, exp, None

def recalculate_action_plan_grounding(plan: ActionPlan, parsed_blocks: List[TextBlock]) -> ActionPlan:
    """
    Recalculates the page_num, bbox, and confidence_score for all fields in an ActionPlan
    by fuzzy matching against the original PDF blocks. Used to prevent LLM hallucination.
    """
    # 1. Recalculate Metadata
    for key, field_obj in plan.case_metadata.dict().items():
        if isinstance(field_obj, dict) and "source_text" in field_obj:
            source = field_obj.get("source_text", "")
            if source:
                block, ratio, exp, anchor = _find_source_block(source, parsed_blocks, field_type="metadata")
                getattr(plan.case_metadata, key).confidence_score = ratio
                getattr(plan.case_metadata, key).page_num = block.page_num if block else 0
                getattr(plan.case_metadata, key).bbox = block.bbox if block else [0.0, 0.0, 0.0, 0.0]
                getattr(plan.case_metadata, key).paragraph_id = block.paragraph_id if block else ""
                
                # Context Slicing
                ctx = block.text if block else ""
                if anchor and len(ctx) > 300:
                    center = (anchor["start"] + anchor["end"]) // 2
                    start_ctx = max(0, center - 150)
                    end_ctx = min(len(ctx), center + 150)
                    ctx = ("..." if start_ctx > 0 else "") + ctx[start_ctx:end_ctx] + ("..." if end_ctx < len(ctx) else "")
                    # Adjust anchor
                    anchor["start"] = anchor["start"] - start_ctx + (3 if start_ctx > 0 else 0)
                    anchor["end"] = anchor["end"] - start_ctx + (3 if start_ctx > 0 else 0)
                
                getattr(plan.case_metadata, key).surrounding_context = ctx
                getattr(plan.case_metadata, key).confidence_explanation = exp
                getattr(plan.case_metadata, key).anchor_offset = anchor
                
    # 2. Recalculate Directives
    for i, d in enumerate(plan.directives):
        source = d.source_text
        if source:
            block, ratio, exp, anchor = _find_source_block(source, parsed_blocks, field_type="directive")
            plan.directives[i].confidence_score = ratio
            plan.directives[i].page_num = block.page_num if block else 0
            plan.directives[i].bbox = block.bbox if block else [0.0, 0.0, 0.0, 0.0]
            plan.directives[i].paragraph_id = block.paragraph_id if block else ""
            
            # Context Slicing
            ctx = block.text if block else ""
            if anchor and len(ctx) > 300:
                center = (anchor["start"] + anchor["end"]) // 2
                start_ctx = max(0, center - 150)
                end_ctx = min(len(ctx), center + 150)
                ctx = ("..." if start_ctx > 0 else "") + ctx[start_ctx:end_ctx] + ("..." if end_ctx < len(ctx) else "")
                # Adjust anchor
                anchor["start"] = anchor["start"] - start_ctx + (3 if start_ctx > 0 else 0)
                anchor["end"] = anchor["end"] - start_ctx + (3 if start_ctx > 0 else 0)
            
            plan.directives[i].surrounding_context = ctx
            plan.directives[i].confidence_explanation = exp
            plan.directives[i].anchor_offset = anchor
            
    return plan

def format_verification_data_node(state: GraphState) -> Dict[str, Any]:
    """
    Combines raw metadata and directives into the ActionPlan format, linking
    each field to its source text, page number, and bounding box. 
    Confidence scores reflect the fuzzy match quality.
    """
    parsed_blocks = state["parsed_blocks"]
    case_meta = state.get("case_metadata_raw")
    directives = state.get("directives_raw", [])
    
    formatted_meta = {}
    case_summary = None
    
    if case_meta:
        case_summary = case_meta.case_summary
        
        for key, field_obj in case_meta.dict().items():
            if key == "case_summary":
                continue
                
            if field_obj and field_obj.get("value"):
                source_text = field_obj.get("source_text", "")
                block, ratio, exp, anchor = _find_source_block(source_text, parsed_blocks, field_type="metadata")
                
                page_num = block.page_num if block else 0
                bbox = block.bbox if block else [0.0, 0.0, 0.0, 0.0]
                paragraph_id = block.paragraph_id if block else ""
                
                # Context Slicing
                ctx = re.sub(r'\s+', ' ', block.text.strip()) if block else ""
                if anchor and len(ctx) > 300:
                    center = (anchor["start"] + anchor["end"]) // 2
                    start_ctx = max(0, center - 150)
                    end_ctx = min(len(ctx), center + 150)
                    ctx = ("..." if start_ctx > 0 else "") + ctx[start_ctx:end_ctx] + ("..." if end_ctx < len(ctx) else "")
                    # Adjust anchor
                    anchor["start"] = anchor["start"] - start_ctx + (3 if start_ctx > 0 else 0)
                    anchor["end"] = anchor["end"] - start_ctx + (3 if start_ctx > 0 else 0)
                    
                formatted_meta[key] = VerificationField(
                    value=str(field_obj["value"]),
                    source_text=source_text,
                    surrounding_context=ctx,
                    page_num=page_num,
                    bbox=bbox,
                    paragraph_id=paragraph_id,
                    confidence_score=ratio,
                    confidence_band=get_confidence_band(ratio),
                    confidence_explanation=exp,
                    anchor_offset=anchor
                )
            else:
                exp = ConfidenceExplanation(match_type="missing", boost_type="none", base_similarity=0.0, grounding_mode="unanchored")
                formatted_meta[key] = VerificationField(
                    value="Not specified",
                    source_text="Not specified",
                    surrounding_context="",
                    page_num=0,
                    bbox=[0.0, 0.0, 0.0, 0.0],
                    paragraph_id="",
                    confidence_score=0.50,
                    confidence_band="LOW",
                    confidence_explanation=exp,
                    anchor_offset=None
                )
            
    # Convert the dictionary to the strict Pydantic model
    # Ensure all expected keys are present, even if empty
    expected_keys = ["case_type", "case_number", "court_name", "date_of_order", "judge_name", "appellant", "respondent", "counsel_details"]
    for key in expected_keys:
        if key not in formatted_meta:
             formatted_meta[key] = VerificationField(
                    value=None,
                    source_text="",
                    page_num=0,
                    bbox=[0.0, 0.0, 0.0, 0.0],
                    confidence_score=0.0
                )
                
    strict_meta = CaseMetadataVerification(**formatted_meta)
    
    formatted_directives = []
    for d in directives:
        # Check if the LLM followed instructions to pull verbatim text
        block, ratio, exp, anchor = _find_source_block(d.directive, parsed_blocks, field_type="directive")
        page_num = block.page_num if block else 0
        bbox = block.bbox if block else [0.0, 0.0, 0.0, 0.0]
        paragraph_id = block.paragraph_id if block else ""
        
        # Context Slicing
        ctx = re.sub(r'\s+', ' ', block.text.strip()) if block else ""
        if anchor and len(ctx) > 300:
            center = (anchor["start"] + anchor["end"]) // 2
            start_ctx = max(0, center - 150)
            end_ctx = min(len(ctx), center + 150)
            ctx = ("..." if start_ctx > 0 else "") + ctx[start_ctx:end_ctx] + ("..." if end_ctx < len(ctx) else "")
            # Adjust anchor
            anchor["start"] = anchor["start"] - start_ctx + (3 if start_ctx > 0 else 0)
            anchor["end"] = anchor["end"] - start_ctx + (3 if start_ctx > 0 else 0)
        
        record = DirectiveRecord(
            summary=d.summary,
            directive=d.directive,
            deadline=d.deadline,
            deadline_reason=d.deadline_reason,
            urgency=d.urgency,
            action_plan=d.action_plan,
            source_text=d.directive,
            surrounding_context=ctx,
            page_num=page_num,
            bbox=bbox,
            paragraph_id=paragraph_id,
            confidence_score=ratio,
            confidence_band=get_confidence_band(ratio),
            confidence_explanation=exp,
            anchor_offset=anchor,
            historical_precedents=search_precedents(d.directive, top_k=3),
            status="Pending"
        )
        formatted_directives.append(record)
    
    # Compute Limitation Data
    limitation_data = None
    if case_meta:
        case_type_val = ""
        date_val = ""
        outcome_type = ""
        directive_text = ""
        
        if case_meta.case_type and case_meta.case_type.value:
            case_type_val = case_meta.case_type.value
        if case_meta.date_of_order and case_meta.date_of_order.value:
            date_val = case_meta.date_of_order.value
        if case_meta.case_summary:
            outcome_type = case_meta.case_summary.case_outcome_type
        if directives:
            directive_text = directives[0].directive
            
        limitation_data = compute_limitation(case_type_val, date_val, outcome_type, directive_text)
        
    action_plan = ActionPlan(
        case_summary=case_summary,
        case_metadata=strict_meta,
        directives=formatted_directives,
        limitation_data=limitation_data
    )
    
    return {"action_plan": action_plan}
