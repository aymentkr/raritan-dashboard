import { Component } from '@angular/core';
import {SensorElement} from "../model/interfaces";
import {SensorService} from "../services/sensor.service";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
  sensors: SensorElement[] = [];
  selectedSensor?: null | SensorElement;

  constructor( ss :SensorService,) {
    this.sensors = ss.getSensors();
  }

}
