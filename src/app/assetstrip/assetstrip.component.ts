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
  isAvailable: boolean = false;
  columns1 = ['rackunit', 'slot', 'id1', 'id2', 'custom'];
  columns2 = ['rackunit','size', 'id1', 'id2', 'custom'];
  displayedColumns1= [...this.columns1,'actions'];
  displayedColumns2= [...this.columns2,'actions'];

  constructor(
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    public ap:AssetsPipe
  ) {}
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.isAvailable;
      this.cdRef.detectChanges();
    });
  }
  addAsset(isExt :boolean) {
    const dialogRef = this.dialog.open(AddAssetComponent, {
      data: isExt
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addRowData(result.data,isExt).then(() => {
          this.cdRef.detectChanges();
        });
      }
    });
  }

  private async addRowData(data: Asset,isExt:boolean) {
    if ( isExt ) {
      this.ap.extensions = [...this.ap.extensions, data];
    } else {
      this.ap.tags = [...this.ap.tags, data];
    }
  }

  clearData(isExt: boolean) {
    if (isExt) {
      this.ap.extensions = [];
    } else {
      this.ap.tags = [];
    }
  }

  deleteItem(item: Asset) {
    // Assuming 'item' is in either 'tags' or 'extensions'
    if (this.ap.tags.includes(item)) {
      this.ap.tags = this.ap.tags.filter(asset => asset !== item);
    } else if (this.ap.extensions.includes(item)) {
      this.ap.extensions = this.ap.extensions.filter(asset => asset !== item);
    }
  }

}
