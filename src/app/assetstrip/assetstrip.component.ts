import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {AssetsPipe} from "../pipes/assets.pipe";
import {Asset} from "../model/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {AddAssetComponent} from "./add-asset/add-asset.component";
import {DataService} from "../services/data.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {NotificationService} from "../services/notification.service";

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
  list = ['AssetID','type', 'ID1', 'ID2', 'Custom'];
  columns: string[] = ['Index',...this.list];
  innercolumns = ['Slot',...this.list];
  displayedColumns= ['Index','state',...this.list,'actions'];

  selectedAsset: Asset | null = null;
  size : number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10,20,30,40,50,60];
  dataSource = new MatTableDataSource<Asset>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<Asset>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  constructor(
    private notificationService: NotificationService,
    private data: DataService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    public ap:AssetsPipe
  ) {}
  ngOnInit(): void {
    this.ap.init().then(() => {
      this.isAvailable = this.ap.connections[0].isEnabled;
      if (this.isAvailable) {
        this.fetchAssetStripData().then(() => {
          this.cdRef.detectChanges()
          this.dataSource.paginator = this.paginator;
        });
      }
      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  async fetchAssetStripData() {
    try {
      const assetArray = this.createDefaultAssets(64);
      /*
      for (const asset of assetArray) {
        const index = assetArray.indexOf(asset);
        this.data.sendToGo(`r, g, b, on, slow, fast = assetstrips[1]:getLEDState(${index})`);
        asset.r = parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${index}):r`, 'print(r)'));
        asset.g = parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${index}):g`, 'print(g)'));
        asset.b = parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${index}):b`, 'print(b)'));
        asset.on = await this.data.getResult(`assetstrips[1]:getLEDState(${index}):on`, 'print(on)') === 'true';
        asset.fast = await this.data.getResult(`assetstrips[1]:getLEDState(${index}):fast`, 'print(fast)') === 'true';
        asset.slow = await this.data.getResult(`assetstrips[1]:getLEDState(${index}):slow`, 'print(slow)') === 'true';
      }*/
      const tags = await this.data.getResult('assetstrips[1]:getTags', 'print(assetstrips[1]:getTags())');
      JSON.parse(tags).forEach((asset: any) => {
        const channelIndex = asset.channel ;
        const assetData = this.createAssetData(asset);

        if (asset.type === 'tag' && asset.col !== 0) {
          const extensions = assetArray[channelIndex].Extensions;
          if (extensions && extensions.length >= 4) extensions[asset.col-1] = assetData;
        } else {
          assetArray[channelIndex] = assetData;
        }
      });
      this.dataSource.data = assetArray;
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
    }
  }

  private createDefaultAssets(size: number): Asset[] {
    return Array.from({ length: size }, (_, index):Asset => ({
      Index: size > 16 ? index + 1 : 0,
      state : false,
      Slot: size <= 16 ? index + 1 : 0,
      AssetID: '',
      type: '',
      ID1: null,
      ID2: null,
      Custom: null,
    }));
  }

  private createAssetData(asset: any): Asset {
    return {
      Index: asset.channel +1,
      state: true,
      Slot: asset.col,
      AssetID: this.ap.convertToAssetId(asset.custom, asset.id1, asset.id2),
      type: asset.type,
      ID1: asset.id1,
      ID2: asset.id2,
      Custom: asset.custom,
      Extensions: asset.type === 'tag' ? [] : this.createDefaultAssets(parseFloat(asset.type.slice(3)))
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
    let command;
    if (data.isTag) {
      command = `assetstrips[1]:setTag(${data.index-1}, ${data.slot}, ${data.id1}, ${data.id2}, ${data.custom})`;
    } else {
      command = `assetstrips[1]:setExt(${data.index-1}, ${data.slot}, ${data.id1}, ${data.id2}, ${data.custom})`;
    }
    this.data.sendToGo(command);

    // Ensure MatTableDataSource reflects the changes
    this.data.removeMap('assetstrips[1]:getTags');
    await this.fetchAssetStripData();
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

  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
