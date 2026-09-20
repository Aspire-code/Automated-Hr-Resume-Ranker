from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class HRUser(Base):
    __tablename__ = "hr_users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)