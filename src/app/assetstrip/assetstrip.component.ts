import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {Asset} from "../model/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {AddAssetComponent} from "./add-asset/add-asset.component";

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
  columns = ['rackunit', 'slot','size', 'id1', 'id2', 'custom'];
  displayedColumns= ['type','params','actions'];

  constructor(
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private ap:AssetsPipe
  ) {}
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.isAvailable;
      this.cdRef.detectChanges();
    });
  }
  addAsset(element: Asset) {
    const dialogRef = this.dialog.open(AddAssetComponent, {
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addRowData(result.data).then(() => {
          console.log(result.data)
          this.cdRef.detectChanges();
        });
      }
    });
  }

  private async addRowData(data: any) {

  }

  clearData() {

  }


  deleteItem() {

  }



}
