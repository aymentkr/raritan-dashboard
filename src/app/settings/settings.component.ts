import {Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";
import {NotificationService} from "../services/notification.service";
import {AssetInput, Notification, SlideToggle} from "../model/interfaces";
import {AssetsPipe} from "../pipes/assets.pipe";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent  implements OnInit {
  isAvailable = false;
  notifications!: Notification[] ;
  displayedColumns : string[] = ['title', 'time', 'message','alert'];
  AssetIn?: AssetInput;
  controls: SlideToggle[];
  connections: SlideToggle[];
  constructor(
    private data: DataService,
    ap: AssetsPipe,
    private notificationService: NotificationService,
  ) {
    this.AssetIn = ap.AssetIn;
    this.controls = ap.controls;
    this.connections = ap.connections;
  }
  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(notifications =>
      this.notifications = notifications
    );
  }
  async onToggleChangeCtrl(option: SlideToggle) {
    const command = `${option.table}[${option.name}]:${option.isEnabled ? 'enable()' : 'disable()'}`;
    this.data.sendToGo(command);
  }


  clearNotifications() {
    this.notificationService.clearAllHistory();
  }

  onToggleChangeCnx(selectedConnection: SlideToggle) {
    this.connections.forEach(connection => {
      if (connection !== selectedConnection) {
        connection.isEnabled = false;
        this.data.sendToGo(`${selectedConnection.table}:disable()`);
      } else {
        this.data.sendToGo(`${selectedConnection.table}:enable()`);
      }
    });
  }
}
