import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Job {
    id?: string;
    title: string;
    description: string;
    embedding?: number[];
    matchScore?: number;
    createdAt?: string;
}

export interface Resume {
    id?: string;
    filename: string;
    content: string;
    createdAt?: string;
}

export interface UploadResponse {
    resume: Resume;
    message: string;
    isDuplicate: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    getJobs(): Observable<Job[]> {
        return this.http.get<Job[]>(`${this.apiUrl}/jobs`);
    }

    createJob(job: Job): Observable<Job> {
        return this.http.post<Job>(`${this.apiUrl}/jobs`, job);
    }

    uploadResume(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<UploadResponse>(`${this.apiUrl}/resumes/upload`, formData);
    }

    matchJobs(resumeId: string): Observable<Job[]> {
        return this.http.post<Job[]>(`${this.apiUrl}/match`, { resumeId });
    }

    getJob(id: string): Observable<Job> {
        return this.http.get<Job>(`${this.apiUrl}/jobs/${id}`);
    }

    getResumes(): Observable<Resume[]> {
        return this.http.get<Resume[]>(`${this.apiUrl}/resumes`);
    }

    getResume(id: string): Observable<Resume> {
        return this.http.get<Resume>(`${this.apiUrl}/resumes/${id}`);
    }

    deleteJob(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/jobs/${id}`);
    }

    deleteResume(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/resumes/${id}`);
    }
}
