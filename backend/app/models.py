from pydantic import BaseModel
from typing import Optional, Any

class Outlook(BaseModel):
    id: Optional[Any] = None
    Theme: Optional[str] = None
    Rank: Optional[int] = None
    Institution: Optional[str] = None
    Call_text: Optional[str] = None
    Year: Optional[int] = None
    Sub_theme: Optional[str] = None
    Section_description: Optional[str] = None

class NarrativeNode(BaseModel):
    id: str
    year: int
    name: str
    rank: int
    type: str  # 'base' or 'theme'

