import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {NotificationService} from "./services/notification.service";
import {Observable} from "rxjs";
import {Notification} from "./model/interfaces";
import {DataService} from "./services/data.service";
import {MatDialog} from "@angular/material/dialog";
import {JsonRpcService} from "./services/json-rpc.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit,OnDestroy {
  notifications!: Observable<Notification[]>;
  title = 'Raritan';
  isConn = "";
  askConn = "";
  isLoading: boolean = true;

  constructor(
    private notificationService: NotificationService,
    private data: DataService,
    public dialog: MatDialog,
    private raritan: JsonRpcService,
  ) {
    this.notifications = this.notificationService.getNotifications();
    setTimeout(() => {
      this.isLoading = false;
    }, 2000)
  }

  ngOnInit() {
    this.data.open();
    // Call the method to send the POST request
    this.raritan.getPduMetaData().subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.error('Error:', error);
    });
  }

  ngOnDestroy(): void {
    this.data.close();
  }

  reloadPage() {
    window.location.reload();
  }

  checkConnection(templateRef: TemplateRef<any>) {
    if (this.data.isConnected()) {
      this.isConn = 'Your Connection is still opened!';
      this.askConn = 'You want to disconnect ?';
    } else {
      this.isConn = 'Your Connection is closed!';
      this.askConn = 'You want to reconnect again ? (this will refresh the page)';
    }
    this.dialog.open(templateRef, {
      width: '600px',
      maxHeight: '400px',
    });
  }

  Connection() {
    if (this.data.isConnected()) {
      this.notificationService.openToastr('You are disconnected from the server', 'Connection', 'warning');
      this.data.close();
      this.dialog.closeAll();
    } else {
      this.reloadPage();
    }
  }
}
