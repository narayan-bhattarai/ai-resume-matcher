# AI Resume & Job Matching Platform - Implementation Plan

## Architecture

The system consists of three main components:
1.  **Frontend (Angular)**: User interface for uploading resumes, posting jobs, and viewing match scores/analytics.
2.  **Backend (Spring Boot)**: Core business logic, file handling, and orchestration.
3.  **ML Service (Python)**: Specialized microservice for Natural Language Processing (Sentence-BERT) and vector embedding generation.

## Data Storage
- **PostgreSQL**: Stores user profiles, resumes (text content), job descriptions, and structured skills.
- **pgvector**: Stores high-dimensional vector embeddings of resumes and job descriptions for semantic search.

## Tech Stack Details
- **Frontend**: Angular 19+ (Standalone components), Chart.js (for analytics).
- **Backend**: Spring Boot 3.2, Java 17, Spring Data JPA.
- **ML**: Python 3.12, FastAPI, Sentence-Transformers, Uvicorn.
- **Database**: Supabase (PostgreSQL 15+ with pgvector).

## Development Steps
1.  **Infrastructure Setup**: Initialize project repositories.
2.  **Database Design**: Define schema for `resumes`, `jobs`, `skills`, and their vector representations.
3.  **ML Service**: Implement API to accept text and return embeddings/extracted skills.
4.  **Backend**: Implement REST API for file upload, job creation, and calling the ML service.
5.  **Frontend**: Build the dashboard, upload forms, and match visualization.
