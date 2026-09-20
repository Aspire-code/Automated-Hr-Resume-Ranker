from pydantic import BaseModel
from typing import Optional

class ResumeBase(BaseModel):
    candidate_id: str
    category: str
    content: str

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: int

    class Config:
        from_attributes = True