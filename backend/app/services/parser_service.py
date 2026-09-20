import os
import io
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
import fitz  # PyMuPDF for PDFs
from docx import Document  # python-docx for Word files
import pandas as pd

class ParserService:
    def __init__(self):
        self.raw_data_path = "data/raw"
        self.processed_data_path = "data/processed"
        self.allowed_extensions = {'.pdf', '.docx', '.doc', '.csv'}
        self.required_keywords = ["education", "experience", "skills", "employment", "summary"]

    def validate_file_extension(self, filename: str):
        """Ensures only accepted document types are processed."""
        ext = Path(filename).suffix.lower()
        if ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {ext}. Only PDF, DOCX, and CSV files are allowed."
            )

    def verify_resume_content(self, text: str):
        """Heuristic check to ensure the document actually looks like a resume."""
        text_lower = text.lower()
        matches = sum(1 for keyword in self.required_keywords if keyword in text_lower)
        
        if len(text.strip()) < 100 or matches < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded document does not appear to be a valid resume. Please upload a document containing standard professional sections (e.g., Experience, Skills, Education)."
            )

    def extract_candidate_name(self, text: str, filename: str) -> str:
        """Attempts to dynamically extract the candidate's name from the top lines of the resume text."""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if lines:
            for line in lines[:3]:
                words = line.split()
                if 2 <= len(words) <= 4 and not any(char.isdigit() for char in line):
                    if not any(keyword in line.lower() for keyword in ["resume", "cv", "curriculum", "email", "phone", "profile"]):
                        return line
                        
        return Path(filename).stem.replace('_', ' ').replace('-', ' ').title()

    async def parse_uploaded_file(self, file: UploadFile):
        """Validates, parses text, extracts the candidate name, and verifies an uploaded resume file."""
        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")
            
        self.validate_file_extension(file.filename)
        
        contents = await file.read()
        extracted_text = ""
        ext = Path(file.filename).suffix.lower()

        if ext == '.pdf':
            try:
                doc = fitz.open(stream=contents, filetype="pdf")
                for page in doc:
                    extracted_text += page.get_text()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF file: {str(e)}")
                
        elif ext in {'.docx', '.doc'}:
            try:
                docx_file = io.BytesIO(contents)
                doc = Document(docx_file)
                extracted_text = "\n".join([para.text for para in doc.paragraphs])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse Word document: {str(e)}")
        
        if ext != '.csv':
            self.verify_resume_content(extracted_text)

        candidate_name = self.extract_candidate_name(extracted_text, file.filename)

        return {
            "filename": file.filename, 
            "name": candidate_name, 
            "content": extracted_text
        }

    def process_csv(self, filename: str):
        file_path = os.path.join(self.raw_data_path, filename)
        self.validate_file_extension(filename)
        
        df = pd.read_csv(file_path)
        processed_df = df.rename(columns={'ID': 'candidate_id', 'Category': 'category', 'Feature': 'content'})
        
        os.makedirs(self.processed_data_path, exist_ok=True)
        output_path = os.path.join(self.processed_data_path, "clean_resume_data.csv")
        processed_df.to_csv(output_path, index=False)
        return output_path