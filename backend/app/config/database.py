import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    server = os.getenv("DB_SERVER", "localhost")
    database = os.getenv("DB_NAME", "ResumeRankerDB")
    # Using Windows Authentication or SQL Server Authentication
    # Example using Trusted Connection (Windows Auth):
    connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
    
    # If using SQL Server Authentication (Username/Password), use this instead:
    # user = os.getenv("DB_USER")
    # password = os.getenv("DB_PASSWORD")
    # connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password}'
    
    conn = pyodbc.connect(connection_string)
    return conn