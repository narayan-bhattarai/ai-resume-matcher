import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, Job } from '../../services/api.service';

@Component({
    selector: 'app-job-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container" *ngIf="job; else loadingTpl">
      <a routerLink="/jobs" class="back-link">← Back to Jobs</a>
      
      <div class="detail-card">
        <h1>{{ job.title }}</h1>
        <div class="meta">
          <span *ngIf="job.createdAt">Posted: {{ job.createdAt | date }}</span>
        </div>
        
        <div class="description">
          <h3>Description</h3>
          <p>{{ job.description }}</p>
        </div>
      </div>
    </div>
    
    <ng-template #loadingTpl>
      <div class="container loading">Loading...</div>
    </ng-template>
  `,
    styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .back-link { display: inline-block; margin-bottom: 1rem; color: #666; text-decoration: none; }
    .back-link:hover { color: #333; }
    .detail-card { background: white; padding: 2rem; border-radius: 8px; border: 1px solid #ddd; }
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
    .description { line-height: 1.6; }
  `]
})
export class JobDetailComponent implements OnInit {
    job: Job | null = null;

    constructor(
        private route: ActivatedRoute,
        private api: ApiService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.api.getJob(id).subscribe({
                next: (job) => this.job = job,
                error: (err) => console.error(err)
            });
        }
    }
}
