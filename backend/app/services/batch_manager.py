import threading
import time
from app.services.ranking_service import RankingService

# In-memory store for tracking batch processing status
batch_status_store = {}
ranking_service = RankingService()

def process_batch_background(batch_id: str, resumes: list[str], criteria: str):
    batch_status_store[batch_id] = {
        "status": "processing",
        "total": len(resumes),
        "completed": 0,
        "results": []
    }
    
    results = []
    for index, resume_text in enumerate(resumes):
        # Evaluate one by one with a safe delay to avoid sudden free-tier spikes
        if index > 0:
            time.sleep(4) 
            
        evaluation = ranking_service.evaluate_against_criteria(resume_text, criteria)
        results.append(evaluation)
        
        # Update progress dynamically
        batch_status_store[batch_id]["completed"] = index + 1
        batch_status_store[batch_id]["results"] = results

    batch_status_store[batch_id]["status"] = "completed"