import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from app.services.parser_service import ParserService
from app.services.ranking_service import RankingService
import time

router = APIRouter(prefix="/api", tags=["Ranking"])
parser_service = ParserService()
ranking_service = RankingService()

# In-memory store for tracking asynchronous batch progress
batch_status_store = {}

class ShortlistRequest(BaseModel):
    candidate_name: str
    candidate_email: str
    job_title: str

def process_batch_background(batch_id: str, extracted_resumes: list[dict], job_qualifications: str):
    """
    Background worker that evaluates already-parsed resume text one-by-one 
    with controlled pauses to respect free-tier rate limits.
    """
    batch_status_store[batch_id] = {
        "status": "processing",
        "total": len(extracted_resumes),
        "completed": 0,
        "results": []
    }
    
    ranked_candidates = []
    
    for idx, item in enumerate(extracted_resumes):
        try:
            # Enforce a delay between AI API requests to prevent RPM spikes (skip first item)
            if idx > 0:
                time.sleep(4)
                
            parsed_data = item["parsed_data"]
            
            # Evaluate resume text against criteria via Gemini AI
            evaluation = ranking_service.evaluate_against_criteria(
                resume_text=parsed_data["content"],
                criteria=job_qualifications
            )
            
            candidate_entry = {
                "id": str(idx + 1),
                "name": parsed_data.get("name", evaluation.get("name", "Unknown Candidate")),
                "match_score": evaluation.get("match_score", 0),
                "experience": evaluation.get("experience", 0),
                "skills": evaluation.get("skills", []),
                "university": evaluation.get("university", "Not Specified"),
                "contact_info": {
                    "email": evaluation.get("email", parsed_data.get("email", "N/A")),
                    "phone": evaluation.get("phone", parsed_data.get("phone", "N/A")),
                    "location": evaluation.get("location", parsed_data.get("location", "N/A")),
                    "linkedin": evaluation.get("linkedin", parsed_data.get("linkedin", "N/A"))
                },
                "status": "Active"
            }
            ranked_candidates.append(candidate_entry)
            
        except Exception as err:
            print(f"Error evaluating resume index {idx}: {err}")
            
        # Update progress dynamically for frontend polling
        batch_status_store[batch_id]["completed"] = idx + 1
        ranked_candidates.sort(key=lambda x: x["match_score"], reverse=True)
        batch_status_store[batch_id]["results"] = ranked_candidates

    batch_status_store[batch_id]["status"] = "completed"

@router.post("/rank")
async def rank_resumes(
    background_tasks: BackgroundTasks,
    job_qualifications: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """
    Safely reads and parses uploaded files synchronously during the request lifecycle,
    then delegates sequential AI evaluation to a background worker.
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided.")
            
        extracted_resumes = []
        for file in files:
            # Parse file content into memory while the request connection is open
            parsed_data = await parser_service.parse_uploaded_file(file)
            extracted_resumes.append({"parsed_data": parsed_data})
            
        batch_id = str(uuid.uuid4())
        
        batch_status_store[batch_id] = {
            "status": "queued",
            "total": len(files),
            "completed": 0,
            "results": []
        }
        
        # Dispatch background processing task with raw text data instead of closed files
        background_tasks.add_task(
            process_batch_background,
            batch_id,
            extracted_resumes,
            job_qualifications
        )
        
        return {"batch_id": batch_id, "message": "Batch ranking initiated in background."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rank-batch/{batch_id}")
def get_batch_status(batch_id: str):
    """
    Polling endpoint for the frontend to check active batch progress.
    """
    if batch_id not in batch_status_store:
        raise HTTPException(status_code=404, detail="Batch ID not found.")
    return batch_status_store[batch_id]

@router.post("/shortlist")
async def shortlist_candidate(payload: ShortlistRequest):
    try:
        sender_email = "your_email@gmail.com"
        sender_password = "your_email_app_password"
        
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = payload.candidate_email
        msg["Subject"] = f"Interview Invitation: {payload.job_title}"
        
        body = f"""
        Dear {payload.candidate_name},
        
        Congratulations! Following our automated evaluation of your resume, we are excited to shortlist you for the {payload.job_title} position. 
        
        Please let us know your availability for an interview discussion this coming week.
        
        Best regards,
        HR Recruitment Team
        """
        msg.attach(MIMEText(body, "plain"))
        
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            
        return {"status": "success", "message": f"Shortlist email sent successfully to {payload.candidate_email}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")