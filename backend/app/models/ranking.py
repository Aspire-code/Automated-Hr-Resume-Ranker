from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class ResumeRanking(Base):
    __tablename__ = "resume_rankings"

    ranking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    skill_match_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    semantic_similarity_score = Column(Float, nullable=True)
    recommendation = Column(String, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)