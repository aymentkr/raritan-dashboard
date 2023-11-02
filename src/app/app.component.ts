import {Component} from '@angular/core';
import {NotificationService} from "./services/notification.service";
import {Observable} from "rxjs";
import {Notification} from "./model/interfaces";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent{
  notifications!: Observable<Notification[]>;
  title = 'Raritan';
  constructor(
    private notificationService: NotificationService,
  ) {
    this.notifications = this.notificationService.getNotifications();
  }

  reloadPage() {
    window.location.reload();
  }









}
