# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Update the connection string below if you are using Microsoft SQL Server or SQLite.
# Example for SQLite: "sqlite:///./resume_ranker.db"
# Example for SQL Server (ODBC Driver): "mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server"
SQLALCHEMY_DATABASE_URL = "sqlite:///./resume_ranker.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency function that creates a new SQLAlchemy session for each request
    and closes it once the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Update the connection string below if you are using Microsoft SQL Server or SQLite.
# Example for SQLite: "sqlite:///./resume_ranker.db"
# Example for SQL Server (ODBC Driver): "mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server"
SQLALCHEMY_DATABASE_URL = "sqlite:///./resume_ranker.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency function that creates a new SQLAlchemy session for each request
    and closes it once the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()