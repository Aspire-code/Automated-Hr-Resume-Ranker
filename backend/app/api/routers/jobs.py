import io
import zipfile
from datetime import date
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from app.config.database import get_db_connection
from app.services.parser_service import ParserService

router = APIRouter(prefix="/api/jobs", tags=["Job Management"])
parser_service = ParserService()

class JobCreateSchema(BaseModel):
    user_id: int
    title: str
    description: str
    requirements: Optional[str] = None
    expiry_date: Optional[str] = None

class JobResponseSchema(BaseModel):
    job_id: int
    user_id: int
    title: str
    description: str
    requirements: Optional[str]
    expiry_date: Optional[str]

    class Config:
        from_attributes = True

@router.post("/", response_model=JobResponseSchema, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreateSchema):
    """Creates a new job opening position posted by an HR user in SQL Server."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Jobs (user_id, title, description, requirements, expiry_date)
            OUTPUT INSERTED.job_id
            VALUES (?, ?, ?, ?, ?)
        """, (job_data.user_id, job_data.title, job_data.description, job_data.requirements, job_data.expiry_date))
        
        job_id = cursor.fetchone()[0]
        conn.commit()
        
        return {
            "job_id": job_id,
            "user_id": job_data.user_id,
            "title": job_data.title,
            "description": job_data.description,
            "requirements": job_data.requirements,
            "expiry_date": job_data.expiry_date
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create job posting: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[JobResponseSchema])
def get_all_jobs():
    """Retrieves all job listings available from the SQL Server database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT job_id, user_id, title, description, requirements, expiry_date FROM Jobs")
        rows = cursor.fetchall()
        jobs_list = []
        for row in rows:
            jobs_list.append({
                "job_id": row[0],
                "user_id": row[1],
                "title": row[2],
                "description": row[3],
                "requirements": row[4],
                "expiry_date": row[5]
            })
        return jobs_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/{job_id}", response_model=JobResponseSchema)
def get_job_by_id(job_id: int):
    """Retrieves specific details for a single job opening from SQL Server."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT job_id, user_id, title, description, requirements, expiry_date FROM Jobs WHERE job_id = ?", (job_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        return {
            "job_id": row[0],
            "user_id": row[1],
            "title": row[2],
            "description": row[3],
            "requirements": row[4],
            "expiry_date": row[5]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/{job_id}/download-resumes")
def download_all_resumes(job_id: int):
    """Downloads all candidate resumes submitted for a specific job as a zip file."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch all resumes/applications associated with this job
        cursor.execute("""
            SELECT r.resume_id, c.name, r.file_name 
            FROM Resumes r
            JOIN Candidates c ON r.candidate_id = c.candidate_id
            WHERE r.job_id = ?
        """, (job_id,))
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No resumes found for this job.")

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for row in rows:
                resume_id, candidate_name, file_name = row[0], row[1], row[2]
                # Assuming files are stored locally or accessible. If your implementation 
                # stores raw binary data in the database, adjust reading logic accordingly.
                file_path = f"uploads/{file_name}" 
                try:
                    with open(file_path, "rb") as f:
                        safe_name = f"{candidate_name.replace(' ', '_')}_{resume_id}.pdf"
                        zip_file.writestr(safe_name, f.read())
                except FileNotFoundError:
                    continue

        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": f"attachment; filename=job_{job_id}_resumes.zip"}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to package resumes: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.put("/{job_id}", response_model=JobResponseSchema)
def update_job(job_id: int, job_data: JobCreateSchema):
    """Updates an existing job posting."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT job_id FROM Jobs WHERE job_id = ?", (job_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job posting not found.")

        cursor.execute("""
            UPDATE Jobs 
            SET title = ?, description = ?, requirements = ?, expiry_date = ?
            WHERE job_id = ?
        """, (job_data.title, job_data.description, job_data.requirements, job_data.expiry_date, job_id))
        
        conn.commit()
        return {
            "job_id": job_id,
            "user_id": job_data.user_id,
            "title": job_data.title,
            "description": job_data.description,
            "requirements": job_data.requirements,
            "expiry_date": job_data.expiry_date
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def delete_job(job_id: int):
    """Deletes a job opening along with its associated resumes and ranking results."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT job_id FROM Jobs WHERE job_id = ?", (job_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job posting not found.")

        # 1. Delete associated ranking results linked to the job's resumes
        cursor.execute("""
            DELETE FROM RankingResults 
            WHERE resume_id IN (SELECT resume_id FROM Resumes WHERE job_id = ?)
        """, (job_id,))

        # 2. Delete resumes associated with this job
        cursor.execute("DELETE FROM Resumes WHERE job_id = ?", (job_id,))

        # 3. Finally, delete the job itself
        cursor.execute("DELETE FROM Jobs WHERE job_id = ?", (job_id,))
        
        conn.commit()
        return {"message": "Job and associated records deleted successfully!"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.post("/{job_id}/apply", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: int,
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    candidate_phone: str = Form(...),
    file: UploadFile = File(...)
):
    """Allows a candidate to apply for a specific job vacancy by uploading their resume PDF with expiry validation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Verify job existence and expiry date validation
        cursor.execute("SELECT expiry_date FROM Jobs WHERE job_id = ?", (job_id,))
        job_row = cursor.fetchone()
        if not job_row:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        
        expiry_date_str = job_row[0]
        if expiry_date_str:
            try:
                # Parse expiry date string (handles standard YYYY-MM-DD formats)
                expiry_date = date.fromisoformat(str(expiry_date_str)[:10])
                if date.today() > expiry_date:
                    raise HTTPException(status_code=400, detail="This job application has closed as the deadline has passed.")
            except ValueError:
                pass # Skip if format doesn't match standard ISO layout

        # 2. Parse uploaded resume file content
        parsed_data = await parser_service.parse_uploaded_file(file)

        # 3. Insert Candidate record
        cursor.execute("""
            INSERT INTO Candidates (name, email, phone)
            OUTPUT INSERTED.candidate_id
            VALUES (?, ?, ?)
        """, (candidate_name, candidate_email, candidate_phone))
        candidate_id = cursor.fetchone()[0]

        # 4. Insert Resume record linked to the job
        skills_str = ", ".join(parsed_data.get("skills", ["General"]))
        cursor.execute("""
            INSERT INTO Resumes (candidate_id, job_id, file_name, skills, experience, education)
            OUTPUT INSERTED.resume_id
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            candidate_id,
            job_id,
            file.filename,
            skills_str,
            str(parsed_data.get("experience", "N/A")),
            str(parsed_data.get("education", "N/A"))
        ))
        resume_id = cursor.fetchone()[0]

        # 5. Initialize default RankingResults entry awaiting AI processing
        cursor.execute("""
            INSERT INTO RankingResults (resume_id, score, rank, remarks)
            VALUES (?, ?, ?, ?)
        """, (resume_id, 0.00, 0, "Application submitted, awaiting admin evaluation."))

        conn.commit()
        return {"message": "Application submitted successfully!"}
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")
    finally:
        cursor.close()
        conn.close()