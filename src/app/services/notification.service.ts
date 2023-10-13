import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { Notification } from '../model/interfaces';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>(this.notifications);

  constructor(private toast: ToastrService) {}

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }
  openToastr(message: string, title: string, alert: 'error' | 'info' | 'done' | 'warning') {
    const timeString = new Date().toLocaleString();
    switch (alert) {
      case 'error':
        this.toast.error(message, title, { timeOut: 3000 });
        break;
      case 'info':
        this.toast.info(message, title, { timeOut: 3000 });
        break;
      case 'done':
        this.toast.success(message, title, { timeOut: 3000 });
        break;
      case 'warning':
        this.toast.warning(message, title, { timeOut: 3000 });
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
