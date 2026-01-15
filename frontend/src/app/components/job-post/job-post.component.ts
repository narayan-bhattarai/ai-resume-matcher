import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Job } from '../../services/api.service';

@Component({
    selector: 'app-job-post',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card fade-in">
      <h2>Post a New Job</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Job Title</label>
          <input type="text" id="title" [(ngModel)]="job.title" name="title" required placeholder="e.g. Senior Software Engineer">
        </div>
        
        <div class="form-group">
          <label for="description">Job Description</label>
          <textarea id="description" [(ngModel)]="job.description" name="description" rows="5" required placeholder="Describe the role and requirements..."></textarea>
        </div>
        
        <button type="submit" [disabled]="loading" class="btn-primary">
          {{ loading ? 'Posting...' : 'Post Job' }}
        </button>
      </form>
    </div>
  `,
    styles: [`
    .card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:disabled {
      opacity: 0.7;
    }
  `]
})
export class JobPostComponent {
    job: Job = { title: '', description: '' };
    loading = false;

    constructor(private api: ApiService) { }

    onSubmit() {
        if (!this.job.title || !this.job.description) return;

        this.loading = true;
        this.api.createJob(this.job).subscribe({
            next: () => {
                alert('Job posted successfully!');
                this.job = { title: '', description: '' };
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                alert('Failed to post job');
                this.loading = false;
            }
        });
    }
}
