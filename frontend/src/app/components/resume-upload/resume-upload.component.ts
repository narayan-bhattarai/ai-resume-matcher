import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Resume } from '../../services/api.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card fade-in">
      <h2>Upload Resume</h2>
      <div 
        class="drop-zone" 
        [class.dragging]="isDragging"
        (dragover)="onDragOver($event)" 
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput 
          type="file" 
          (change)="onFileSelected($event)" 
          accept=".pdf,.docx" 
          style="display: none">
          
        <div *ngIf="!uploading; else loadingTpl">
            <p class="icon">📄</p>
            <p>Drag & drop your resume here or click to browse</p>
            <p class="sub-text">Supported formats: PDF, DOCX</p>
        </div>
        
        <ng-template #loadingTpl>
            <div class="loader"></div>
            <p>Analyzing resume & extracting skills...</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }
    .drop-zone {
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      padding: 1rem; /* Further reduced */
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 120px; /* Enforce limits */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .drop-zone:hover, .drop-zone.dragging {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .icon {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
      margin-top: 0;
    }
    .sub-text {
      color: #9ca3af;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ResumeUploadComponent {
  @Output() resumeUploaded = new EventEmitter<Resume>();
  isDragging = false;
  uploading = false;

  constructor(private api: ApiService, private snackbar: SnackbarService) { }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.upload(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      this.upload(event.target.files[0]);
    }
  }

  upload(file: File) {
    this.uploading = true;
    this.api.uploadResume(file).subscribe({
      next: (response) => {
        this.uploading = false;

        if (response.isDuplicate) {
          this.snackbar.show(response.message, 'info');
        } else {
          // Optional success message for new uploads?
          // this.snackbar.show('Resume uploaded successfully', 'success');
        }

        this.resumeUploaded.emit(response.resume);
      },
      error: (err) => {
        console.error(err);
        this.uploading = false;

        let msg = 'Upload failed';
        if (err.error && err.error.message) {
          msg = err.error.message;
        } else if (err.message) {
          msg = err.message;
        }

        this.snackbar.show(msg, 'error');
      }
    });
  }
}
