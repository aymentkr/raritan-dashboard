import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {AssetInput} from "../model/interfaces";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-assetstrip',
  templateUrl: './assetstrip.component.html',
  styleUrls: ['./assetstrip.component.css']
})

export class AssetstripComponent implements OnInit{
  tags: AssetInput[] = [];
  extensions: AssetInput[] = [];
  isAvailable: boolean = false;
  columns = ['rackunit', 'slot', 'id1', 'id2', 'custom'];
  displayedColumns= [...this.columns,'actions'];
  @ViewChild('sort') sort!: MatSort;

  constructor(private ap:AssetsPipe) {
  }
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.isAvailable;
      /*
      this.tags.push({
        rackunit:1,
        slot:1,
        id1:1,
        id2:1,
        custom:true
      })*/
    });
  }


  clearData() {

  }

  addItem() {

  }

  deleteItem(element:AssetInput) {

  }
}
