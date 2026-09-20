from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hr_user_id = Column(Integer, ForeignKey("hr_users.user_id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)  # Store skills as text or JSON string
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="job", cascade="all, delete-orphan", passive_deletes=True)