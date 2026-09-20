import sys
import json
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Initialize the Gemini client using the new google-genai SDK
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def evaluate(job_description, resume_text):
    prompt = f"""
    Compare the following resume against the job description and return a JSON object with:
    - score (float percentage, e.g. 88.50)
    - rank (integer, e.g. 1)
    - remarks (string with brief evaluation notes)

    Job Description: {job_description}
    Resume Text: {resume_text}
    """
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
    )
    return response.text

if __name__ == "__main__":
    # Example receiving data from Node.js standard input or arguments
    job_desc = sys.argv[1]
    resume_txt = sys.argv[2]
    
    result_json = evaluate(job_desc, resume_txt)
    print(result_json) # Node.js will capture this output