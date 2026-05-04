from typing import Dict, Any
from utils.llm import get_llm
from core.schemas import GraphState, CaseMetadata
from logger import get_logger
from config import settings

logger = get_logger(__name__)

def extract_metadata_node(state: GraphState) -> Dict[str, Any]:
    """
    Extracts case metadata (Case Details, Parties, Date of Order, etc.) from the full text.
    """
    logger.info("Extracting case metadata...")
    full_text = state["full_text"]
    
    llm = get_llm()
    structured_llm = llm.with_structured_output(CaseMetadata)
    
    prompt = f"""
    You are a legal metadata extraction AI.
    Extract the following details from the given court judgment text.
    For each field, provide the extracted 'value' and the EXACT 'source_text' from which you derived it.
    If a field is not found, leave it empty.
    IMPORTANT: Clean the 'value' field for presentation (e.g., remove '& ORS', 'and others' from names), but you MUST preserve the EXACT verbatim string in the 'source_text' field. Never paraphrase the source_text.
    
    ALSO provide a structured 'case_summary' consisting of:
    1. context: The background of the case.
    2. decision: The final decision of the court. You MUST explicitly include the core legal principle driving the decision (e.g., 'dismissed as barred by limitation').
    3. impact: The impact or consequence of this decision.
    4. case_outcome_type: Classify exactly as 'Terminal', 'Procedural', 'Actionable', or 'Mixed'.
    5. is_action_required: false if Terminal, true otherwise.
    6. reasoning: Include the 'primary_reason' and a list of 'supporting_factors'.
    
    Text:
    {full_text[:10000]} # Limit to first 10k chars for metadata to save tokens
    """
    
    case_metadata = structured_llm.invoke(prompt)
    
    return {"case_metadata_raw": case_metadata}
