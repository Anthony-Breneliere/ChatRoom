import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MyNotification {
  message: string;
  type: 'success' | 'error' | 'info';  // Type de notification
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<MyNotification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  constructor() { }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 2000) {
    this.notificationSubject.next({ message, type });
    console.log("Notification recue ")
    setTimeout(() => {
      this.notificationSubject.next(null);
    }, duration);
  }

  hideNotification() {
    this.notificationSubject.next(null);
  }
}
