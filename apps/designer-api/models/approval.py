from pydantic import BaseModel
from enum import Enum
from uuid import UUID


class ApprovalState(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ApprovalRequest(BaseModel):
    designer_id: UUID
    notes: str = ""


class ApprovalDecision(BaseModel):
    designer_id: UUID
    decision: ApprovalState
    reviewer_notes: str = ""
