import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Job, Resume } from '../../services/api.service';
import { ResumeUploadComponent } from '../resume-upload/resume-upload.component';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ResumeUploadComponent, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header" [class.compact]="currentResume">
        <h1>AI Resume Matcher</h1>
        <p class="subtitle" *ngIf="!currentResume">Upload a new resume or select an existing one to get started.</p>
      </div>

      <div class="grid" [class.has-matches]="matches.length > 0 || currentResume" [class.initial-view]="!currentResume">
        <!-- Left Column: Upload / Select -->
        <div class="col upload-column">
          <div class="section-card upload-card">
            <h3>Upload New Resume</h3>
             <app-resume-upload (resumeUploaded)="onResumeUploaded($event)"></app-resume-upload>
          </div>

          <div class="divider"><span>OR</span></div>

          <div class="section-card select-card">
            <h3>Select Existing Resume</h3>
            <select class="select-control" [ngModel]="selectedResumeId" (ngModelChange)="onResumeSelected($event)">
              <option [ngValue]="null" disabled>-- Choose a Resume --</option>
              <option *ngFor="let resume of resumes" [ngValue]="resume.id">
                {{ resume.filename }}
              </option>
            </select>
          </div>
          
          <div *ngIf="currentResume" class="resume-card fade-in">
            <div class="resume-info">
                <h3>Current Profile</h3>
                <p class="file-name">{{ currentResume.filename }}</p>
                <span class="status-badge">Analyzed</span>
            </div>
            <button class="btn-clear" (click)="clearSelection()">Clear Selection</button>
          </div>
        </div>

        <!-- Right Column: Matches -->
        <div class="col matches-column" *ngIf="currentResume">
          <h2 class="section-title" *ngIf="matches.length > 0 || loadingMatches">Recommended Jobs</h2>
          
          <div *ngIf="loadingMatches" class="loading-state">
            <div class="loader"></div>
            <p>Analyzing profile & finding matches...</p>
          </div>

          <div *ngFor="let job of matches; let i = index" class="job-card fade-in" [style.animation-delay]="i * 100 + 'ms'">
            <div class="match-score">
              <span class="score">{{ getMatchScore(job) }}%</span>
              <span class="label">Match</span>
            </div>
            <div class="job-details">
              <h3>{{ job.title }}</h3>
              <p class="description">{{ job.description | slice:0:150 }}...</p>
              <button (click)="viewJobDetails(job)" class="btn-text">View Job Details →</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Details Modal -->
    <div *ngIf="selectedJob" class="modal-overlay" (click)="closeJobDetails()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ selectedJob.title }}</h2>
          <button class="close-btn" (click)="closeJobDetails()">×</button>
        </div>
        <div class="modal-body">
          <div class="match-banner">
            <span class="score-badge">{{ getMatchScore(selectedJob) }}% Match</span>
            <span class="relevance-text">{{ getRelevanceText(selectedJob) }}</span>
          </div>
          <h3>Description</h3>
          <p class="full-description">{{ selectedJob.description }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeJobDetails()">Close</button>
          <a [routerLink]="['/jobs', selectedJob.id]" class="btn-primary">Full Page View</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 600px; /* narrowed for better focus */
      margin: 2rem auto;
      padding: 0 1.5rem;
      transition: max-width 0.4s ease;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding-top: 1rem;
    }
    .header.compact { margin-bottom: 1rem; }
    
    .header h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      font-weight: 800;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.025em;
    }
    .subtitle { color: #6b7280; font-size: 1.1rem; margin: 0; max-width: 600px; margin-left: auto; margin-right: auto; }

    .grid { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .upload-column {
       display: flex;
       flex-direction: column;
       gap: 1rem; 
    }

    /* Active State (Stacked Left) */
    .grid.has-matches {
        display: grid;
        grid-template-columns: 320px 1fr;
        align-items: start;
        gap: 2rem; 
    }
    
    /* Ensure container grows when grid grows */
    :host ::ng-deep .dashboard-container:has(.grid.has-matches) {
       max-width: 1200px;
    }

    /* Cards */
    .section-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .section-card h3 { margin-top: 0; font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 1rem; }
    
    .select-control { 
        width: 100%; padding: 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; background-color: #fff; cursor: pointer;
    }
    .select-control:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    /* Current Resume Card */
    .resume-card {
      padding: 1.5rem;
      background: #eff6ff;
      border-radius: 12px;
      border: 1px solid #bfdbfe;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .resume-info h3 { margin: 0 0 0.25rem 0; font-size: 0.9rem; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
    .file-name { margin: 0; font-weight: 600; color: #1e3a8a; word-break: break-all; }
    .status-badge { inline-size: fit-content; background: #dbeafe; color: #1e40af; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 600; margin-top: 0.5rem; display: inline-block;}
    
    .btn-clear {
        background: white;
        border: 1px solid #bfdbfe;
        color: #2563eb;
        padding: 0.5rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.2s;
    }
    .btn-clear:hover { background: #dbeafe; }
    

    
    .job-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 1rem;
      display: flex;
      gap: 1.5rem;
      border: 1px solid #f3f4f6;
      transition: transform 0.2s;
    }
    .job-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .match-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 80px;
      height: 80px;
      background: #eff6ff;
      border-radius: 12px;
      color: #2563eb;
    }
    .score {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
    }
    .job-details h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    .description {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .btn-text {
      background: none;
      border: none;
      color: #2563eb;
      font-weight: 600;
      padding: 0;
      margin-top: 0.5rem;
      cursor: pointer;
    }
    .btn-text:hover {
      text-decoration: underline;
    }
    
    .fade-in {
      animation: fadeIn 0.5s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s ease-out;
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; color: #111827; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
    .modal-body { padding: 1.5rem; }
    .match-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .score-badge {
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 700;
    }
    .relevance-text { color: #065f46; font-weight: 500; font-size: 0.9rem; }
    .full-description { white-space: pre-wrap; color: #4b5563; line-height: 1.6; }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-secondary {
      background: white;
      border: 1px solid #d1d5db;
      color: #374151;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      border: none;
      cursor: pointer;
    }
    .btn-primary:hover { background: #1d4ed8; }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentResume: Resume | null = null;
  resumes: Resume[] = [];
  selectedResumeId: string | null = null;

  matches: Job[] = [];
  loadingMatches = false;

  selectedJob: Job | null = null;

  constructor(private api: ApiService, private snackbar: SnackbarService) { }

  ngOnInit() {
    this.loadResumes();
  }

  loadResumes() {
    this.api.getResumes().subscribe({
      next: (data) => this.resumes = data,
      error: (err) => console.error(err)
    });
  }

  onResumeUploaded(resume: Resume) {
    this.currentResume = resume;
    this.selectedResumeId = resume.id || null;
    this.loadResumes(); // Refresh list to include new one
    this.findMatches(resume.id!);
    this.snackbar.show('Resume uploaded successfully!', 'success');
  }

  onResumeSelected(resumeId: string) {
    this.selectedResumeId = resumeId;
    const found = this.resumes.find(r => r.id === resumeId);
    if (found) {
      this.currentResume = found;
      this.findMatches(resumeId);
    }
  }

  findMatches(resumeId: string) {
    this.loadingMatches = true;
    this.api.matchJobs(resumeId).subscribe({
      next: (jobs) => {
        this.matches = jobs;
        this.loadingMatches = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMatches = false;
        this.snackbar.show('Failed to load matches', 'error');
      }
    });
  }

  getMatchScore(job: Job): number {
    if (!job.matchScore) return 0;
    // Subtract 0.18 to account for linguistic noise (common words)
    // and remove the artificial 1.4 multiplier
    let adjusted = Math.max(0, job.matchScore - 0.18);
    let percentage = adjusted * 100;
    return Math.min(100, Math.round(percentage));
  }

  getRelevanceText(job: Job): string {
    const score = this.getMatchScore(job);
    if (score >= 80) return 'High relevance based on your skills';
    if (score >= 50) return 'Moderate relevance based on your skills';
    return 'Low relevance - some skills overlap';
  }

  viewJobDetails(job: Job) {
    this.selectedJob = job;
  }

  closeJobDetails() {
    this.selectedJob = null;
  }

  clearSelection() {
    this.currentResume = null;
    this.selectedResumeId = null;
    this.matches = [];
  }
}
