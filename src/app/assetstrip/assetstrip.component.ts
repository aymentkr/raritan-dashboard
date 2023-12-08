import { Component } from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";

@Component({
  selector: 'app-assetstrip',
  templateUrl: './assetstrip.component.html',
  styleUrls: ['./assetstrip.component.css']
})
export class AssetstripComponent {
  isAvailable: boolean;

  constructor(private ap:AssetsPipe) {
    this.isAvailable = this.ap.isAvailable;
  }

}
