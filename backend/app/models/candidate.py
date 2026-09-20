from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)