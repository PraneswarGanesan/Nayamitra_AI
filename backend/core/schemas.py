from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TextBlock(BaseModel):
    text: str
    page_num: int
    bbox: List[float] # [x0, y0, x1, y1]
    paragraph_id: str = ""

class ConfidenceExplanation(BaseModel):
    match_type: str = Field(description="e.g., exact_match, partial_match, missing")
    boost_type: str = Field(description="e.g., header_boost, directive_boost, none")
    base_similarity: float = Field(description="Base difflib similarity score before boosts")
    grounding_mode: str = Field(default="unanchored", description="verbatim, fuzzy, fallback, or unanchored")

class ExtractedField(BaseModel):
    value: Optional[str] = Field(description="The extracted value")
    source_text: Optional[str] = Field(description="The exact sentence or phrase from the document that is the source of this value")

class CaseReasoning(BaseModel):
    primary_reason: str = Field(description="The primary reason for the court's decision")
    supporting_factors: List[str] = Field(description="List of supporting factors or arguments")

class CaseSummary(BaseModel):
    context: str = Field(description="Background context of the case in 1-2 sentences")
    decision: str = Field(description="The final decision of the court")
    impact: str = Field(description="The impact or consequence of this decision")
    case_outcome_type: str = Field(description="Must be exactly one of: 'Terminal', 'Procedural', 'Actionable', or 'Mixed'")
    is_action_required: bool = Field(description="False if Terminal, True otherwise")
    reasoning: CaseReasoning

class CaseMetadata(BaseModel):
    case_type: Optional[ExtractedField] = None
    case_number: Optional[ExtractedField] = None
    court_name: Optional[ExtractedField] = None
    date_of_order: Optional[ExtractedField] = None
    judge_name: Optional[ExtractedField] = None
    appellant: Optional[ExtractedField] = None
    respondent: Optional[ExtractedField] = None
    counsel_details: Optional[ExtractedField] = None
    case_summary: Optional[CaseSummary] = None

class ActionPlanDetails(BaseModel):
    what: str = Field(description="What specific action needs to be executed")
    who: str = Field(description="Who is responsible (e.g. Legal Dept, Revenue, Police)")
    when: str = Field(description="By when the action must be completed")
    priority: str = Field(description="STRICTLY UPPERCASE: LOW, MEDIUM, HIGH")

class DirectiveRaw(BaseModel):
    summary: str = Field(description="Plain English summary of the directive")
    directive: str = Field(description="VERBATIM exact quote of the directive from the text. DO NOT paraphrase.")
    deadline: str = Field(description="Exact deadline computed from text or 'N/A' if none")
    deadline_reason: str = Field(description="Explanation for the deadline, e.g. 'No actionable directive'")
    urgency: str = Field(description="Strictly uppercase: RED, AMBER, GREEN, LOW, MEDIUM, or HIGH")
    action_plan: ActionPlanDetails

class ReviewAction(BaseModel):
    approved: bool = False
    edited_value: Optional[str] = None
    reviewed_by: Optional[str] = None

class VerificationField(BaseModel):
    value: Optional[str] = None
    source_text: str
    surrounding_context: str = ""
    page_num: int
    bbox: List[float]
    paragraph_id: str = ""
    confidence_score: float = 1.0
    confidence_band: str = "HIGH"
    confidence_explanation: Optional[ConfidenceExplanation] = None
    anchor_offset: Optional[Dict[str, int]] = None
    status: str = "Pending"
    review: ReviewAction = Field(default_factory=ReviewAction)

class LimitationData(BaseModel):
    is_appealable: bool = False
    statutory_period_days: int = 0
    date_of_order: str = ""
    computed_deadline_date: str = ""
    urgency_status: str = "GREEN"
    reasoning: str = ""

class PrecedentMatch(BaseModel):
    case_number: str = ""
    similarity_score: float = 0.0
    historical_directive: str = ""
    department_action_taken: str = ""
    outcome: str = ""

class DirectiveRecord(BaseModel):
    summary: str
    directive: str
    deadline: str
    deadline_reason: str
    urgency: str
    action_plan: ActionPlanDetails
    source_text: str
    surrounding_context: str = ""
    page_num: int
    bbox: List[float]
    paragraph_id: str = ""
    confidence_score: float = 1.0
    confidence_band: str = "HIGH"
    confidence_explanation: Optional[ConfidenceExplanation] = None
    anchor_offset: Optional[Dict[str, int]] = None
    historical_precedents: List[PrecedentMatch] = []
    status: str = "Pending"
    review: ReviewAction = Field(default_factory=ReviewAction)

class CaseMetadataVerification(BaseModel):
    case_type: VerificationField
    case_number: VerificationField
    court_name: VerificationField
    date_of_order: VerificationField
    judge_name: VerificationField
    appellant: VerificationField
    respondent: VerificationField
    counsel_details: VerificationField

class ActionPlan(BaseModel):
    case_summary: Optional[CaseSummary] = None
    case_metadata: CaseMetadataVerification
    directives: List[DirectiveRecord]
    limitation_data: Optional[LimitationData] = None

# LangGraph State Schema
from typing_extensions import TypedDict

class GraphState(TypedDict):
    pdf_path: str
    parsed_blocks: List[TextBlock]
    full_text: str
    operative_text: str
    case_metadata_raw: Optional[CaseMetadata]
    directives_raw: List[DirectiveRaw]
    action_plan: Optional[ActionPlan]
    limitation_data: Optional[LimitationData]
    human_verified: bool

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str = "law_officer"
    tenant_id: str = "default_tenant"

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
