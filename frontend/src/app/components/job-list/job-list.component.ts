import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Job } from '../../services/api.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmationDialogComponent],
  template: `
    <div class="container">
      <div class="header-row">
        <h2>All Jobs</h2>
        <button (click)="togglePostForm()" class="btn-primary">
          {{ showPostForm ? 'Cancel' : 'Post New Job' }}
        </button>
      </div>

      <div *ngIf="showPostForm" class="post-form-card fade-in">
        <h3>Post a New Job</h3>
        <div class="form-group">
          <label>Job Title</label>
          <input [(ngModel)]="newJob.title" placeholder="e.g. Senior Software Engineer" class="input-control">
        </div>
        <div class="form-group">
          <label>Job Description</label>
          <textarea [(ngModel)]="newJob.description" rows="5" placeholder="Enter job description..." class="input-control"></textarea>
        </div>
        <button (click)="postJob()" [disabled]="!newJob.title || !newJob.description" class="btn-submit">
          Publish Job
        </button>
      </div>
      
      <div *ngIf="loading" class="loading">Loading jobs...</div>
      
      <div *ngIf="!loading && jobs.length === 0" class="empty">
        No jobs found. Post one above!
      </div>

      <div class="job-grid">
        <div *ngFor="let job of jobs" class="job-card">
          <h3>{{ job.title }}</h3>
          <p class="desc">{{ job.description | slice:0:100 }}...</p>
          <div class="actions">
            <a [routerLink]="['/jobs', job.id]" class="btn-link">View Details</a>
            <button (click)="confirmDelete(job)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>
    
    <app-confirmation-dialog 
      *ngIf="jobToDelete" 
      title="Delete Job" 
      [message]="'Are you sure you want to delete the job: ' + jobToDelete.title + '?'"
      (confirm)="onDeleteConfirmed()"
      (cancel)="onDeleteCancelled()">
    </app-confirmation-dialog>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-row h2 { margin: 0; }
    
    .btn-primary { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #1d4ed8; }
    
    .post-form-card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
    .input-control { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; }
    .btn-submit { background: #166534; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .job-grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); margin-top: 1rem; }
    .job-card { padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; background: white; overflow: hidden; }
    .job-card:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .desc { color: #666; font-size: 0.9rem; }
    .btn-link { color: #2563eb; text-decoration: none; font-weight: 600; margin-right: 1rem; }
    .btn-link:hover { text-decoration: underline; }
    .btn-delete { color: #dc2626; background: none; border: none; font-weight: 600; cursor: pointer; }
    .btn-delete:hover { text-decoration: underline; }
    
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  showPostForm = false;
  newJob: Job = { title: '', description: '' };
  jobToDelete: Job | null = null;

  constructor(private api: ApiService, private snackbar: SnackbarService) { }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.api.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  confirmDelete(job: Job) {
    this.jobToDelete = job;
  }

  onDeleteConfirmed() {
    if (this.jobToDelete && this.jobToDelete.id) {
      const id = this.jobToDelete.id;
      this.api.deleteJob(id).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== id);
          this.jobToDelete = null;
          this.snackbar.show('Job deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Failed to delete job', err);
          this.snackbar.show('Failed to delete job', 'error');
          this.jobToDelete = null;
        }
      });
    }
  }

  onDeleteCancelled() {
    this.jobToDelete = null;
  }

  togglePostForm() {
    this.showPostForm = !this.showPostForm;
  }

  postJob() {
    if (!this.newJob.title || !this.newJob.description) return;

    this.api.createJob(this.newJob).subscribe({
      next: (job) => {
        this.jobs.unshift(job); // Add to top of list
        this.newJob = { title: '', description: '' };
        this.showPostForm = false;
        this.snackbar.show('Job posted successfully!', 'success');
      },
      error: (err) => {
        console.error('Failed to post job', err);
        this.snackbar.show('Failed to post job', 'error');
      }
    });
  }
}
