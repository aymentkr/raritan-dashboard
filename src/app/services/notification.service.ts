import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Notification } from '../model/interfaces';
import {snackbarConfig} from "../model/environment";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>(this.notifications);

  constructor( private snackBar: MatSnackBar ) {}

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }
  openToastr(message: string, title: string, alert: 'error' | 'info' | 'done' | 'warning') {
    const timeString = new Date().toLocaleString();
    switch (alert) {
      case 'error':
        this.snackBar.open(message, title , snackbarConfig('error-snackbar'));
        break;
      case 'info':
        this.snackBar.open(message, title , snackbarConfig('info-snackbar'));
        break;
      case 'done':
        this.snackBar.open(message, title , snackbarConfig('success-snackbar'));
        break;
      case 'warning':
        this.snackBar.open(message, title , snackbarConfig('warning-snackbar'));
        break;
      default:
        break;
    }
    this.addNotification({
      title: title,
      time: timeString,
      message: message,
      alert: alert,
    });
  }

  addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.getValue();
    currentNotifications.push(notification);
    this.notificationsSubject.next(currentNotifications);
  }

  clearAllHistory() {
    this.notifications = [];
    this.notificationsSubject.next(this.notifications);
  }
}
