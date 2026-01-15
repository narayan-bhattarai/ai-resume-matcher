import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Resume } from '../../services/api.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="container">
      <h2>Uploaded Resumes</h2>
      
      <div *ngIf="loading" class="loading">Loading resumes...</div>
      
      <div *ngIf="!loading && resumes.length === 0" class="empty">
        No resumes uploaded. <a routerLink="/">Upload one now</a>
      </div>

      <div class="resume-list">
        <div *ngFor="let resume of resumes" class="resume-item">
          <div class="info">
            <strong>{{ resume.filename }}</strong>
            <span class="id">ID: {{ resume.id }}</span>
          </div>
          <div class="actions">
            <button (click)="confirmDelete(resume)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>
    
    <app-confirmation-dialog 
      *ngIf="resumeToDelete" 
      title="Delete Resume" 
      [message]="'Are you sure you want to delete the resume: ' + resumeToDelete.filename + '?'"
      (confirm)="onDeleteConfirmed()"
      (cancel)="onDeleteCancelled()">
    </app-confirmation-dialog>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .resume-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
    .resume-item { padding: 1rem; background: white; border: 1px solid #ddd; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .info { display: flex; flex-direction: column; }
    .id { font-size: 0.8rem; color: #888; }
    .btn-delete { color: #dc2626; background: none; border: none; font-weight: 600; cursor: pointer; }
    .btn-delete:hover { text-decoration: underline; }
  `]
})
export class ResumeListComponent implements OnInit {
  resumes: Resume[] = [];
  loading = true;
  resumeToDelete: Resume | null = null;

  constructor(private api: ApiService, private snackbar: SnackbarService) { }

  ngOnInit() {
    this.loadResumes();
  }

  loadResumes() {
    this.loading = true;
    this.api.getResumes().subscribe({
      next: (resumes) => {
        this.resumes = resumes;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  confirmDelete(resume: Resume) {
    this.resumeToDelete = resume;
  }

  onDeleteConfirmed() {
    if (this.resumeToDelete && this.resumeToDelete.id) {
      const id = this.resumeToDelete.id;
      this.api.deleteResume(id).subscribe({
        next: () => {
          this.resumes = this.resumes.filter(r => r.id !== id);
          this.resumeToDelete = null;
          this.snackbar.show('Resume deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Failed to delete resume', err);
          this.snackbar.show('Failed to delete resume', 'error');
          this.resumeToDelete = null;
        }
      });
    }
  }

  onDeleteCancelled() {
    this.resumeToDelete = null;
  }
}
