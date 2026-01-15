# AI Resume & Job Matching Platform

## Prerequisites
- Java 17+
- Python 3.12+ (with PIP)
- Node.js 18+
- Docker (optional, but recommended for DB/ML)

## Setup

### 1. Database (Supabase or Local PostgreSQL)
Ensure you have a PostgreSQL database compatible with `pgvector`.
Update `backend/src/main/resources/application.properties` with your credentials.

### 2. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
Runs on `http://localhost:8000`.

### 3. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
(First time will download dependencies).
Runs on `http://localhost:8080`.

### 4. Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```
Runs on `http://localhost:4200`.

## Architecture
- **Frontend**: Uploads PDF -> Backend.
- **Backend**: 
  1. Texts extraction.
  2. Sends text -> ML Service -> Embeddings.
  3. Saves embedding -> DB.
  4. Matches uses cosine distance in DB.
