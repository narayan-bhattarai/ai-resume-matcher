-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY,
    filename VARCHAR(255),
    content TEXT,
    skills TEXT,
    embedding float8[], -- Changed to standard array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    embedding float8[], -- Changed to standard array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
