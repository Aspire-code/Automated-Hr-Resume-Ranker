import os
import json
import time
import pandas as pd
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

class CandidateEvaluationSchema(BaseModel):
    match_score: int = Field(description="Integer between 0 and 100 representing exact candidate fitness match score computed strictly from this specific resume text against job requirements")
    experience: int = Field(description="Total years of professional experience extracted from this specific resume text")
    skills: list[str] = Field(description="Core hard skills uniquely extracted from this specific resume text")
    university: str = Field(description="Highest academic background or university institution found in this specific resume text, or Not Specified")
    email: str = Field(description="Exact email address found in this specific resume text, or N/A")
    phone: str = Field(description="Exact phone number found in this specific resume text, or N/A")
    location: str = Field(description="Exact physical location or city found in this specific resume text, or N/A")
    remarks: str = Field(description="Short summary evaluation remarks detailing alignment with features and job qualifications")

class RankingService:
    def __init__(self, dataset_paths: list[str] = ["jobs_dataset_with_features.xlsx"]):
        self.client = genai.Client()
        
        dfs = []
        for path in dataset_paths:
            if os.path.exists(path):
                try:
                    df = pd.read_excel(path)
                    dfs.append(df)
                except Exception as e:
                    print(f"Failed to load dataset {path}: {e}")
                    
        if dfs:
            self.dataset_df = pd.concat(dfs, ignore_index=True)
        else:
            self.dataset_df = None

    def find_dataset_features(self, criteria: str) -> str:
        """
        Searches the dataset for matching job features using flexible keyword token overlap
        so variations in dropdown titles still successfully pull relevant role specifications.
        """
        if self.dataset_df is None or self.dataset_df.empty:
            return criteria
            
        criteria_lower = criteria.lower()
        best_match = None
        max_overlap = 0

        for _, row in self.dataset_df.iterrows():
            role = str(row.get("Role", ""))
            features = str(row.get("Features", ""))
            role_lower = role.lower()
            
            # Direct or substring match check
            if criteria_lower in role_lower or role_lower in criteria_lower:
                return f"Role: {role}\nRequired Features & Skills: {features}"
                
            # Token overlap fallback for messy or compound job strings
            criteria_tokens = set(criteria_lower.split())
            role_tokens = set(role_lower.split())
            overlap = len(criteria_tokens.intersection(role_tokens))
            
            if overlap > max_overlap:
                max_overlap = overlap
                best_match = f"Role: {role}\nRequired Features & Skills: {features}"
                
        if best_match and max_overlap > 0:
            return best_match
            
        # Fallback to original criteria string if no semantic overlap is detected
        return criteria

    def evaluate_against_criteria(self, resume_text: str, criteria: str) -> dict:
        enhanced_criteria = self.find_dataset_features(criteria)

        prompt = f"""
        You are an expert HR recruitment assistant. Perform a rigorous, independent, and granular evaluation of the candidate resume provided below against the specified Job Qualifications and Features. 
        
        Job Qualifications & Features:
        {enhanced_criteria}
        
        Candidate Resume:
        {resume_text}
        
        Instructions:
        1. Compute a distinct match_score (0-100) based strictly on how well this specific candidate's profile matches the job criteria and feature requirements.
        2. Accurately extract contact details (email, phone, location), university/academic background, skills, and experience directly from this text. If a field is missing, return "N/A" or "Not Specified".
        3. Provide concise remarks evaluating the candidate's core strengths and fit.
        """
        
        max_retries = 3
        backoff_delay = 5

        for attempt in range(max_retries):
            try:
                time.sleep(2)
                
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',  
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=CandidateEvaluationSchema,
                        temperature=0.1,  
                    ),
                )
                
                if hasattr(response, 'parsed') and response.parsed:
                    result = response.parsed
                    return {
                        "match_score": int(result.match_score),
                        "experience": int(result.experience),
                        "skills": result.skills,
                        "university": result.university,
                        "email": result.email,
                        "phone": result.phone,
                        "location": result.location,
                        "remarks": result.remarks
                    }
                elif response.text:
                    raw_data = json.loads(response.text.strip())
                    return {
                        "match_score": int(raw_data.get("match_score", 50)),
                        "experience": int(raw_data.get("experience", 0)),
                        "skills": raw_data.get("skills", []),
                        "university": raw_data.get("university", "Not Specified"),
                        "email": raw_data.get("email", "N/A"),
                        "phone": raw_data.get("phone", "N/A"),
                        "location": raw_data.get("location", "N/A"),
                        "remarks": raw_data.get("remarks", "Evaluated successfully.")
                    }
                else:
                    raise ValueError("Empty response received from Gemini model.")
                
            except Exception as e:
                error_str = str(e)
                print(f"CRITICAL AI EVALUATION ERROR (Attempt {attempt + 1}/{max_retries}): {error_str}")
                import traceback
                traceback.print_exc()
                
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    print(f"Rate limit hit. Retrying in {backoff_delay} seconds...")
                    time.sleep(backoff_delay)
                    backoff_delay *= 2
                else:
                    break

        return {
            "match_score": 0,
            "experience": 0,
            "skills": [],
            "university": "Not Specified",
            "email": "N/A",
            "phone": "N/A",
            "location": "N/A",
            "remarks": "Evaluation failed due to an exception. Check your server terminal logs for details."
        }