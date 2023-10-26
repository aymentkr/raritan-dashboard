import {Component, OnInit} from '@angular/core';
import {WebsocketService} from "../services/websocket.service";
import {DataService} from "../services/data.service";
import {NotificationService} from "../services/notification.service";
import {Notification} from "../model/interfaces";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent  implements OnInit {
  notifications!: Notification[] ;
  displayedColumns : string[] = ['title', 'time', 'message','alert'];

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(notifications =>
      this.notifications = notifications
    );
  }

  constructor(
    private WSS: WebsocketService,
    private _dataService: DataService,
    private notificationService: NotificationService
  ) {}


  options = this._dataService.options;
  async onToggleChange(option: { name: string; isEnabled: boolean }) {
    if (option.isEnabled)
       this.WSS.sendMessage(`ctrls[${option.name}]:enable()`);
    else
       this.WSS.sendMessage(`ctrls[${option.name}]:disable()`);
  }


  clearNotifications() {
    this.notificationService.clearAllHistory();
  }
}
