import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {Asset} from "../model/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {AddAssetComponent} from "./add-asset/add-asset.component";
import {DataService} from "../services/data.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";

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
  isLoading: boolean = true;
  columns: string[] = ['channel', 'type', 'AssetID', 'id1', 'id2', 'custom'];
  innercolumns = ['col', 'type', 'AssetID', 'id1', 'id2', 'custom'];
  displayedColumns= [...this.columns,'actions'];
  selectedAsset: Asset | null = null;

  dataSource = new MatTableDataSource<Asset>;
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
      if (this.isAvailable) {
        this.fetchAssetStripData().then(() => this.cdRef.detectChanges());
      }
      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  async fetchAssetStripData() {
    try {
      const tags = await this.data.getResult('assetstrips[1]:getTags', 'print(assetstrips[1]:getTags())');
      this.dataSource.data = [... this.convertToAssets(JSON.parse(tags))]
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
    }
  }



  convertToAssets(data: any): Asset[] {
    const assetArray= this.createDefaultAssets(64);

    data.forEach((asset: any) => {
      const channelIndex = asset.channel;
      const assetData = this.createAssetData(asset);

      if (asset.type === 'tag' && asset.col !== 0) {
        assetArray[channelIndex].extensions![asset.col-1] = assetData;
      } else {
        assetArray[channelIndex] = assetData;
      }
    });

    return assetArray;
  }
  private createDefaultAssets(size: number): Asset[] {
    return Array.from({ length: size }, (_, index) => ({
      channel: size>16 ? index : 0,
      col: size <= 16 ? index+1 : 0,
      AssetID: '',
      type: '',
      id1: null,
      id2: null,
      custom: false,
    }));
  }



  private createAssetData(asset: any): Asset {
    return {
      AssetID: this.ap.convertToAssetId(asset.custom, asset.id1, asset.id2),
      channel: asset.channel,
      col: asset.col,
      type: asset.type,
      id1: asset.id1,
      id2: asset.id2,
      custom: asset.custom,
      extensions: asset.type === 'tag' ? [] : this.createDefaultAssets(parseFloat(asset.type.slice(3)))
  };
  }


  addAsset() {
    const dialogRef = this.dialog.open(AddAssetComponent, {
      data: this.dataSource.data,
      width: '800px',
      height: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addRowData(result.data).then(() => {
          this.cdRef.detectChanges();
        });
      }
    });
  }

  private async addRowData(data: any) {
    const channelIndex = data.asset.channel;
    this.dataSource.data[channelIndex] = data.asset;

    if (data.isExt) {
      this.data.sendToGo(`assetstrips[1]:setExt(${data.asset.rackunit}, 16, ${data.asset.id1}, ${data.asset.id2}, ${data.asset.custom})`);
    } else {
      this.data.sendToGo(`assetstrips[1]:setTag(${data.asset.rackunit}, ${data.asset.slot}, ${data.asset.id1}, ${data.asset.id2}, ${data.asset.custom})`);
    }

    // Ensure MatTableDataSource reflects the changes
    this.dataSource.data = [...this.dataSource.data];
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


  toggleDeviceDetails(element: Asset, event: MouseEvent) {
    event.stopPropagation();
    this.selectedAsset = this.selectedAsset === element ? null : element;
    this.cdRef.detectChanges();
  }
}
