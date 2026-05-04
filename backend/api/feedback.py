"""
Feedback-Loop Learning Router

Logs human corrections to department routing so the system
can improve its assignment accuracy over time.
"""

import os
import json
from typing import Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from api.auth import get_current_user
from database.db import log_audit
from logger import get_logger
from config import settings

router = APIRouter()
logger = get_logger(__name__)

WEIGHTS_PATH = str(settings.DB_PATH.parent / "department_weights.json")


class RouterFeedback(BaseModel):
    directive_text: str
    original_department: str
    corrected_department: str


def _load_weights() -> Dict:
    if os.path.exists(WEIGHTS_PATH):
        with open(WEIGHTS_PATH, "r") as f:
            return json.load(f)
    return {}


def _save_weights(weights: Dict):
    with open(WEIGHTS_PATH, "w") as f:
        json.dump(weights, f, indent=2)


def get_department_bias() -> Dict:
    """Return current learned department routing weights for use by the extractor."""
    return _load_weights()


@router.post("/feedback")
async def submit_routing_feedback(
    feedback: RouterFeedback,
    current_user: dict = Depends(get_current_user)
):
    """
    Log a human correction to department routing.
    Updates the local weight file so future extractions can
    bias towards the corrected department.
    """
    weights = _load_weights()
    
    # Build a correction record
    key = feedback.corrected_department.lower().strip()
    if key not in weights:
        weights[key] = {"corrections": 0, "keywords": []}
    
    weights[key]["corrections"] += 1
    
    # Extract keywords from the directive that map to this department
    directive_words = set(feedback.directive_text.lower().split())
    # Only add meaningful words (length > 3, not common stopwords)
    stopwords = {"the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "has", "with", "this", "that", "from", "they", "been", "said", "each", "which", "their", "will", "other", "about", "many", "then", "them", "some", "would", "make", "like", "time", "very", "when", "come", "could", "than", "look", "only", "into", "over", "also", "back", "after", "work", "first", "well", "even", "want", "because", "these", "give", "most"}
    new_keywords = [w for w in directive_words if len(w) > 3 and w not in stopwords]
    
    existing = set(weights[key]["keywords"])
    for kw in new_keywords:
        existing.add(kw)
    weights[key]["keywords"] = list(existing)
    
    _save_weights(weights)
    
    # Also log to audit trail
    log_audit(
        user_id=current_user["id"],
        document_id=None,
        action="ROUTER_FEEDBACK",
        details={
            "original": feedback.original_department,
            "corrected": feedback.corrected_department,
            "directive_snippet": feedback.directive_text[:100]
        }
    )
    
    logger.info(f"Router feedback logged: {feedback.original_department} → {feedback.corrected_department} (total corrections for '{key}': {weights[key]['corrections']})")
    
    return {
        "message": "Routing weights updated for future extractions.",
        "department": feedback.corrected_department,
        "total_corrections": weights[key]["corrections"]
    }
