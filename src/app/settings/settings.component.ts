import {Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";
import {NotificationService} from "../services/notification.service";
import {AssetInput, Notification} from "../model/interfaces";
import {AssetsPipe} from "../pipes/assets.pipe";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent  implements OnInit {
  isAvailable = false;
  notifications!: Notification[] ;
  displayedColumns : string[] = ['title', 'time', 'message','alert'];
  AssetIn: AssetInput;
  options: any;
  constructor(
    private data: DataService,
    private ap: AssetsPipe,
    private notificationService: NotificationService,
  ) {
    this.AssetIn = ap.AssetIn;
    this.options = ap.controls;
  }
  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(notifications =>
      this.notifications = notifications
    );
    this.fetchData();
  }
  async onToggleChange(option: { name: number; isEnabled: boolean }) {
    if (option.isEnabled)
      this.data.sendToGo(`ctrls[${option.name}]:enable()`);
    else
      this.data.sendToGo(`ctrls[${option.name}]:disable()`);
  }


  clearNotifications() {
    this.notificationService.clearAllHistory();
  }

  changeAssetState() {
    if (this.AssetIn.isEnabled)
      this.data.sendToGo('assetstrips[1]:enable()');
    else
      this.data.sendToGo('assetstrips[1]:disable()');
  }

  private async fetchData() {
    const size = parseFloat(await this.data.getResult('#assetstrips', 'print(#assetstrips)'));
    if (size === 1) {
      this.isAvailable = true;
      this.changeAssetState();
    }
  }

  onFormSubmit(doorForm: NgForm) {

  }
}
