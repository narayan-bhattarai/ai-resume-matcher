import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-snackbar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="snackbarService.snackbar$ | async as msg" 
         class="snackbar" 
         [ngClass]="msg.type">
      {{ msg.text }}
    </div>
  `,
    styles: [`
    .snackbar {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 2000;
      animation: slideUp 0.3s ease-out;
      min-width: 300px;
      text-align: center;
    }
    .success { background: #166534; }
    .error { background: #dc2626; }
    .info { background: #3b82f6; }
    
    @keyframes slideUp {
      from { transform: translate(-50%, 20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `]
})
export class SnackbarComponent {
    constructor(public snackbarService: SnackbarService) { }
}
