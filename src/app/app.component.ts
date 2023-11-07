import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationService} from "./services/notification.service";
import {Observable} from "rxjs";
import {Notification} from "./model/interfaces";
import {DataService} from "./services/data.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit,OnDestroy{
  notifications!: Observable<Notification[]>;
  title = 'Raritan';
  isLoading: boolean = true;
  constructor(
    private notificationService: NotificationService,
    private data: DataService
  ) {
    this.notifications = this.notificationService.getNotifications();
    setTimeout(() => {
      this.isLoading = false;
    },1000)
  }
  ngOnInit() {
    this.data.open();
  }

  ngOnDestroy(): void {
    this.data.close();
  }

  reloadPage() {
    window.location.reload();
  }

  Connection() {
    let title,text: string;
    if (this.data.isConnected()) {
      title = 'Your Connection is still opened!';
      text = 'You want to disconnect ?';
    } else {
      title = 'Your Connection is closed!';
      text = 'You want to reconnect again ? (this will refresh the page)';
    }
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showConfirmButton : true,
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.data.isConnected()) {
          Swal.fire(
            'Disconnected!',
            'You are disconnected from the server',
            'success'
          )
          this.notificationService.openToastr('You are disconnected from the server', 'Connection', 'warning');
          this.data.close();
        } else {
          this.reloadPage();
        }
      }
    });
  }
}
