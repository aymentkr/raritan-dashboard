import { Component } from '@angular/core';
import {WebsocketService} from "../services/websocket.service";
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  constructor(private WSS: WebsocketService,private _dataService: DataService) {
  }


  options = this._dataService.options;
  onToggleChange(option: { name: string; isEnabled: boolean }) {
    if (option.isEnabled)

      this.WSS.sendMessage(`ctrls[${option.name}]:enable()`);
    else
      this.WSS.sendMessage(`ctrls[${option.name}]:disable()`);
  }

}
