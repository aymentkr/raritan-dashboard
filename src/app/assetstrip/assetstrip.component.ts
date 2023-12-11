import {Component, OnInit} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {Asset} from "../model/interfaces";

@Component({
  selector: 'app-assetstrip',
  templateUrl: './assetstrip.component.html',
  styleUrls: ['./assetstrip.component.css']
})

export class AssetstripComponent implements OnInit{
  assets: Asset[] = [
    {
      type : 'Tags',
      params : [],
    },
    {
      type : 'Blade Extensions',
      params : [],
    }
  ];
  isAvailable: boolean = false;
  columns = ['rackunit', 'slot', 'id1', 'id2', 'custom'];
  displayedColumns= ['type','params','actions'];

  constructor(private ap:AssetsPipe) {

  }
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.isAvailable;
    });
  }
  addItem() {

  }

  clearData() {

  }


  deleteItem() {

  }


}
