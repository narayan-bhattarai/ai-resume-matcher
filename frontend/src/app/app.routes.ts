import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JobPostComponent } from './components/job-post/job-post.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'post-job', component: JobPostComponent },
    { path: 'jobs', loadComponent: () => import('./components/job-list/job-list.component').then(m => m.JobListComponent) },
    { path: 'jobs/:id', loadComponent: () => import('./components/job-detail/job-detail.component').then(m => m.JobDetailComponent) },
    { path: 'resumes', loadComponent: () => import('./components/resume-list/resume-list.component').then(m => m.ResumeListComponent) },
    { path: '**', redirectTo: '' }
];
