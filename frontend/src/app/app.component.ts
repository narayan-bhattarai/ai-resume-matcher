import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SnackbarComponent } from './components/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SnackbarComponent],
  template: `
    <div class="app-container">
      <nav>
        <div class="logo" routerLink="/" style="cursor: pointer;">
           <img src="/assets/logo.png" alt="CVynapse" class="logo-img">
        </div>
        <div class="links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/jobs" routerLinkActive="active">Jobs</a>
          <a routerLink="/resumes" routerLinkActive="active">Resumes</a>
        </div>
      </nav>
      
      <main>
        <router-outlet></router-outlet>
      </main>
      
      <app-snackbar></app-snackbar>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', system-ui, sans-serif;
    }
    nav {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-img {
      height: 64px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }
    .links a {
      margin-left: 2rem;
      text-decoration: none;
      color: #6b7280;
      font-weight: 500;
      transition: color 0.2s;
    }
    .links a:hover, .links a.active {
      color: #2563eb;
    }
    main {
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {
  title = 'frontend';
}
