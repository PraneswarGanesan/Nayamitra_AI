"""
Deterministic Limitation Period Reasoner

A rule-based engine that computes exact appeal deadlines based on the
Limitation Act and case type. No LLM involved — pure deterministic logic.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
from backend.core.schemas import LimitationData
from backend.logger import get_logger

logger = get_logger(__name__)

# ── Limitation Act Rule Table ──────────────────────────────────────────────
# Maps case_type keywords to statutory limitation periods (in days).
# Source: The Limitation Act, 1963 & Supreme Court Rules
LIMITATION_RULES: Dict[str, Dict] = {
    "writ appeal": {
        "days": 30,
        "section": "Section 5 of the Limitation Act",
        "appealable": True,
    },
    "writ petition": {
        "days": 90,
        "section": "Article 226/227 — No strict limitation, but 90-day convention applies",
        "appealable": True,
    },
    "special leave petition": {
        "days": 90,
        "section": "Article 136 — SLP must be filed within 90 days of the impugned order",
        "appealable": True,
    },
    "slp": {
        "days": 90,
        "section": "Article 136 — SLP must be filed within 90 days of the impugned order",
        "appealable": True,
    },
    "civil appeal": {
        "days": 90,
        "section": "Order XLI Rule 1 CPC — 90 days from date of decree",
        "appealable": True,
    },
    "criminal appeal": {
        "days": 30,
        "section": "Section 374 CrPC — 30 days from date of sentence",
        "appealable": True,
    },
    "review petition": {
        "days": 30,
        "section": "Order XLVII Rule 1 CPC — 30 days from date of order",
        "appealable": True,
    },
    "intra court appeal": {
        "days": 30,
        "section": "Letters Patent Appeal — 30 days from date of single judge order",
        "appealable": True,
    },
    "contempt petition": {
        "days": 365,
        "section": "Section 20 of Contempt of Courts Act — 1 year limitation",
        "appealable": False,
    },
    "execution petition": {
        "days": 365 * 3,  # 3 years
        "section": "Article 136 of Limitation Act — 3 years for execution",
        "appealable": False,
    },
}

# Keywords that indicate a terminal/non-appealable outcome
TERMINAL_KEYWORDS = [
    "dismissed", "disposed", "closed", "no further action", 
    "infructuous", "withdrawn", "not pressed"
]


def _parse_date(date_str: str) -> Optional[datetime]:
    """Try multiple date formats to parse the order date."""
    formats = [
        "%d.%m.%Y",     # 18.01.2024
        "%d-%m-%Y",     # 18-01-2024
        "%Y-%m-%d",     # 2024-01-18
        "%d/%m/%Y",     # 18/01/2024
        "%B %d, %Y",    # January 18, 2024
        "%d %B %Y",     # 18 January 2024
        "%d %b %Y",     # 18 Jan 2024
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def _match_case_type(case_type_str: str) -> Optional[Dict]:
    """Fuzzy match the case type string against the rule table."""
    if not case_type_str:
        return None
    normalized = case_type_str.lower().strip()
    
    # Direct match first
    if normalized in LIMITATION_RULES:
        return LIMITATION_RULES[normalized]
    
    # Partial keyword match
    for key, rule in LIMITATION_RULES.items():
        if key in normalized or normalized in key:
            return rule
    
    return None


def _compute_urgency(days_remaining: int) -> str:
    """Compute urgency color based on days until deadline."""
    if days_remaining < 0:
        return "RED"  # Already expired
    elif days_remaining <= 15:
        return "RED"
    elif days_remaining <= 45:
        return "AMBER"
    else:
        return "GREEN"


def compute_limitation(case_type: str, date_of_order: str, case_outcome_type: str = "", directive_text: str = "") -> LimitationData:
    """
    The core limitation engine.
    
    Takes:
        - case_type: e.g., "Writ Appeal", "SLP"
        - date_of_order: e.g., "18.01.2024"
        - case_outcome_type: e.g., "Terminal", "Actionable"
        - directive_text: The extracted directive for terminal keyword detection
    
    Returns:
        LimitationData with computed deadline and urgency.
    """
    # Check if it's a terminal case
    is_terminal = case_outcome_type.lower() == "terminal"
    if not is_terminal and directive_text:
        directive_lower = directive_text.lower()
        is_terminal = any(kw in directive_lower for kw in TERMINAL_KEYWORDS)
    
    if is_terminal:
        logger.info(f"Case is terminal ({case_outcome_type}). No appeal deadline computed.")
        return LimitationData(
            is_appealable=False,
            statutory_period_days=0,
            date_of_order=date_of_order,
            computed_deadline_date="N/A",
            urgency_status="GREEN",
            reasoning=f"Case outcome is '{case_outcome_type}'. No appeal deadline applies — close file and record outcome."
        )
    
    # Parse the date
    order_date = _parse_date(date_of_order)
    if not order_date:
        logger.warning(f"Could not parse date_of_order: '{date_of_order}'")
        return LimitationData(
            is_appealable=True,
            statutory_period_days=0,
            date_of_order=date_of_order,
            computed_deadline_date="UNABLE TO COMPUTE",
            urgency_status="RED",
            reasoning=f"Date '{date_of_order}' could not be parsed. Manual verification required."
        )
    
    # Match the case type to a rule
    rule = _match_case_type(case_type)
    if not rule:
        logger.warning(f"No limitation rule found for case_type: '{case_type}'")
        return LimitationData(
            is_appealable=True,
            statutory_period_days=0,
            date_of_order=date_of_order,
            computed_deadline_date="UNABLE TO COMPUTE",
            urgency_status="AMBER",
            reasoning=f"Case type '{case_type}' does not match any known limitation rule. Manual computation required."
        )
    
    # Compute the deadline
    deadline_date = order_date + timedelta(days=rule["days"])
    days_remaining = (deadline_date - datetime.now()).days
    urgency = _compute_urgency(days_remaining)
    
    logger.info(f"Limitation computed: {rule['days']} days from {date_of_order} = {deadline_date.strftime('%Y-%m-%d')} ({days_remaining} days remaining, {urgency})")
    
    return LimitationData(
        is_appealable=rule["appealable"],
        statutory_period_days=rule["days"],
        date_of_order=date_of_order,
        computed_deadline_date=deadline_date.strftime("%Y-%m-%d"),
        urgency_status=urgency,
        reasoning=f"Under {rule['section']}, the statutory limitation period is {rule['days']} days from the date of order. Deadline: {deadline_date.strftime('%d %B %Y')}. ({days_remaining} days remaining)"
    )
