from typing import Dict, Any
from utils.llm import get_llm
from langchain_core.prompts import PromptTemplate
from core.schemas import GraphState
from logger import get_logger
from config import settings

logger = get_logger(__name__)

def extract_operative_portion_node(state: GraphState) -> Dict[str, Any]:
    """
    Uses Gemini to identify the operative portion of the judgment.
    """
    logger.info("Extracting operative portion...")
    full_text = state["full_text"]
    
    llm = get_llm()
    
    prompt = PromptTemplate.from_template(
        """You are a legal AI assistant. Your task is to extract ONLY the operative portion of the given court judgment.
The operative portion usually contains the final directives, orders, or conclusions of the court (e.g., 'we allow the appeal', 'the petition is dismissed', 'we direct the respondents to...').
It is typically found towards the end of the document.

Extract ONLY the operative portion text. Do not add any conversational filler.

Judgment Text:
{text}

Operative Portion:"""
    )
    
    chain = prompt | llm
    
    response = chain.invoke({"text": full_text})
    operative_text = response.content.strip()
    
    return {"operative_text": operative_text}
