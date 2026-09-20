from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    file_path = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_features = Column(Text, nullable=True)  # Store parsed JSON features as text or JSON type if preferred
    uploaded_at = Column(DateTime, default=datetime.utcnow)