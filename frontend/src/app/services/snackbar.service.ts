import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SnackbarMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    private snackbarSubject = new BehaviorSubject<SnackbarMessage | null>(null);
    snackbar$ = this.snackbarSubject.asObservable();

    show(text: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
        this.snackbarSubject.next({ text, type });
        setTimeout(() => {
            this.snackbarSubject.next(null);
        }, duration);
    }
}
