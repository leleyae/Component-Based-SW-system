from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class DesignerCreate(BaseModel):
    name: str
    style: str  # e.g. "Interior Style", "Graphic Design"
    email: EmailStr
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None


class DesignerUpdate(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None


class DesignerResponse(BaseModel):
    id: UUID
    name: str
    style: str
    email: str
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None

    class Config:
        from_attributes = True
