import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {Asset} from "../model/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {AddAssetComponent} from "./add-asset/add-asset.component";
import {DataService} from "../services/data.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-assetstrip',
  templateUrl: './assetstrip.component.html',
  styleUrls: ['./assetstrip.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class AssetstripComponent implements OnInit{
  isAvailable: boolean = false;
  columns: string[] = ['rackunit', 'AssetID', 'size', 'id1', 'id2', 'custom'];
  innercolumns = ['rackunit', 'AssetID', 'slot', 'id1', 'id2', 'custom'];
  displayedColumns= [...this.columns,'actions'];
  selectedAsset: Asset | null = null;


  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<Asset>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  constructor(
    private data: DataService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    public ap:AssetsPipe
  ) {}
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.connections[0].isEnabled;
      this.cdRef.detectChanges();
    });
  }
  addAsset() {
    const dialogRef = this.dialog.open(AddAssetComponent, {

      width: '800px',
      height: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addRowData(result.data).then(() => {
          this.cdRef.detectChanges();
        });
      }
    });
  }

  private async addRowData(asset: Asset) {

      this.data.sendToGo(`assetstrips[1]:setExt(${asset.rackunit}, 16, ${asset.id1}, ${asset.id2}, ${asset.custom})`);
      this.ap.tags = [...this.ap.tags, asset];

      this.data.sendToGo(`assetstrips[1]:setTag(${asset.rackunit}, ${asset.slot}, ${asset.id1}, ${asset.id2}, ${asset.custom})`);
  }

  clearData(isExt: boolean) {/*
    if (isExt) {
      this.ap.extensions = [];
    } else {
      this.ap.tags = [];
    }*/
  }

  deleteItem(item: Asset) {/*
    // Assuming 'item' is in either 'tags' or 'extensions'
    if (this.ap.tags.includes(item)) {
      this.ap.tags = this.ap.tags.filter(asset => asset !== item);
    } else if (this.ap.extensions.includes(item)) {
      this.ap.extensions = this.ap.extensions.filter(asset => asset !== item);
    }*/
  }

}
