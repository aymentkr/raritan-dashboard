import { Component } from '@angular/core';
import {SensorElement} from "../model/interfaces";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
  selectedSensor?: null | SensorElement;

  constructor( ) {
  }

}
