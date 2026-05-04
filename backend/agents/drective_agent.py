from typing import Dict, Any, List
from utils.llm import get_llm
from pydantic import BaseModel
from core.schemas import GraphState, DirectiveRaw
from logger import get_logger

logger = get_logger(__name__)

class DirectivesList(BaseModel):
    directives: List[DirectiveRaw]

def extract_directives_node(state: GraphState) -> Dict[str, Any]:
    """
    Extracts structured directives from the operative text, enforcing verbatim extraction first.
    """
    logger.info("Extracting structured directives...")
    operative_text = state["operative_text"]
    metadata = state.get("case_metadata_raw")
    date_of_order = "Unknown"
    outcome_type = "Unknown"
    if metadata:
        if metadata.date_of_order and metadata.date_of_order.value:
            date_of_order = metadata.date_of_order.value
        if metadata.case_summary:
            outcome_type = metadata.case_summary.case_outcome_type
    
    llm = get_llm()
    structured_llm = llm.with_structured_output(DirectivesList)
    
    prompt = f"""
    You are a legal directive extraction engine. You operate in strict layers.
    
    DATE OF ORDER: {date_of_order}
    CASE OUTCOME TYPE: {outcome_type}
    
    Text to analyze:
    {operative_text}
    
    For each directive found in the text, you MUST follow these steps in order:
    
    STEP 1 (EXTRACTION): Extract the exact VERBATIM quote from the text that forms the directive.
    Put this in the 'directive' field. YOU MUST COPY AND PASTE THE EXACT SENTENCE. Do not summarize or trim words. If you paraphrase, the system will fail.
    
    STEP 2 (INTERPRETATION): Write a concise 'summary' (1 sentence). You MUST include the core procedural/limitation reasoning behind the directive (e.g., 'dismissed as barred by limitation'). Do not summarize pending applications, costs, or secondary boilerplate.
    
    STEP 3 (DECISION & TIMELINES):
    - Compute the 'deadline'. Use the DATE OF ORDER and any explicit text (e.g. "within 30 days"). If it's an appeal, standard limitation is usually 30 or 90 days. If no deadline exists or it's a Terminal case, return 'N/A'.
    - Provide a 'deadline_reason', explaining why the deadline is what it is (e.g. "No actionable directive" or "30 days specified in text").
    - Assess 'urgency'. This must be STRICTLY UPPERCASE: 'RED' (<15 days), 'AMBER' (15-45 days), 'GREEN' (>45 days), 'LOW' (No action), 'MEDIUM' (Procedural), or 'HIGH' (Immediate action).
    
    STEP 4 (ACTION PLAN):
    - 'what': What must be done? (If CASE OUTCOME TYPE is 'Terminal', this MUST be 'Close file / Record outcome').
    - 'who': Map the responsible department. If 'Terminal', assign to 'Legal Department' or 'Records Unit'. Otherwise, map based on content (e.g. Revenue, Police, Nodal Officer).
    - 'when': The timeframe for execution.
    - 'priority': High, Medium, or Low. (If 'Terminal', priority MUST be 'Low').
    """
    
    max_retries = 2
    attempts = 0
    error_feedback = ""
    
    while attempts <= max_retries:
        try:
            result = structured_llm.invoke(prompt + error_feedback)
            directives = result.directives
            
            # Validation: Are any directives too short? (summarized instead of verbatim)
            too_short = any(len(d.directive.split()) < 6 for d in directives)
            
            if too_short:
                if attempts < max_retries:
                    logger.warning(f"Extracted directive too short (likely summarized). Retrying... Attempt {attempts + 1}")
                    error_feedback = "\n\nERROR IN PREVIOUS EXTRACTION: You summarized the directive. You MUST extract the full, complete sentence verbatim. Do not shorten it."
                    attempts += 1
                    continue
                else:
                    # HARD FAILURE: Trigger fallback extraction strategy
                    logger.error("LLM failed to extract verbatim directive after retries. Triggering fallback extraction strategy.")
                    parsed_blocks = state.get("parsed_blocks", [])
                    total_pages = max([b.page_num for b in parsed_blocks]) if parsed_blocks else 1
                    threshold_page = max(1, int(total_pages * 0.8))
                    
                    for d in directives:
                        if len(d.directive.split()) < 6:
                            source_tokens = set(d.directive.lower().split())
                            best_fallback_block = None
                            best_overlap = 0.0
                            
                            for block in parsed_blocks:
                                if block.page_num < threshold_page:
                                    continue
                                block_tokens = set(block.text.lower().split())
                                overlap = len(source_tokens & block_tokens) / len(source_tokens) if source_tokens else 0
                                if overlap >= 0.50 and overlap > best_overlap:
                                    best_overlap = overlap
                                    best_fallback_block = block
                                    
                            if best_fallback_block:
                                logger.info(f"Fallback extraction anchored to block on page {best_fallback_block.page_num}")
                                d.directive = best_fallback_block.text.strip()
                            else:
                                raise ValueError("HARD FAILURE: Directive extraction failed to find verbatim text, and fallback could not anchor to the document.")
                
            logger.info(f"Successfully extracted {len(directives)} directives.")
            break
        except Exception as e:
            logger.error(f"Failed to extract directives: {str(e)}")
            directives = []
            break
        
    return {"directives_raw": directives}
