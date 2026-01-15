from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import uvicorn
import os

app = FastAPI()

# Load model (downloading takes time on first run)
# We use a lightweight model for speed
model = SentenceTransformer('all-MiniLM-L6-v2')

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed_text(request: TextRequest):
    try:
        embedding = model.encode(request.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

SKILLS_DB = [
    "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Spring Boot",
    "Node.js", "Django", "Flask", "SQL", "PostgreSQL", "MongoDB", "AWS", "Azure", "GCP",
    "Docker", "Kubernetes", "Git", "CI/CD", "Machine Learning", "AI", "Data Analysis"
]

import re

@app.post("/extract_info")
def extract_info(request: TextRequest):
    text = request.text
    text_lower = text.lower()
    
    # 1. Skills
    found_skills = [skill for skill in SKILLS_DB if skill.lower() in text_lower]
    
    # 2. Email
    email = None
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        email = email_match.group(0)
        
    # 3. Phone
    phone = None
    # Simple regex for US/Intl numbers
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        phone = phone_match.group(0)

    # 4. Name (Heuristic)
    # Look for first line that isn't empty, isn't "Resume"/"CV", and looks like a name
    name = "Unknown"
    lines = text.split('\n')
    for line in lines[:10]: # Check first 10 lines
        line = line.strip()
        if not line:
            continue
        
        # Skip common headers
        if line.lower() in ["resume", "cv", "curriculum vitae", "profile", "contact"]:
            continue
            
        # Skip if looks like email or phone
        if "@" in line or re.search(r'\d', line):
            continue
            
        # Assume a name is 2-4 words, mostly alphabetic
        words = line.split()
        if 2 <= len(words) <= 4 and all(w.isalpha() or '.' in w for w in words):
            name = line
            break
        
    return {
        "skills": list(set(found_skills)),
        "email": email,
        "phone": phone,
        "name": name
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)