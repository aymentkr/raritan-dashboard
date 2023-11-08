import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import {SelectionModel} from "@angular/cdk/collections";
import {DataService} from "../services/data.service";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Outlet} from "../model/interfaces";
import {MatPaginator} from "@angular/material/paginator";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css'],
})

export class OutletComponent implements OnInit {
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'name',
    'state',
    'voltage',
    'frequency',
    'current',
    'act_power',
    'app_power',
    'edit',
  ];
  dataSource = new MatTableDataSource<Outlet>();
  outlets: Outlet[] = [];
  pageSizeOptions: number[] = [5,10, 15,20, 30,35,40];
  size : number = 0;
  pageSize: number = 10;
  editableRowIndex: number = -1;
  isLoading: boolean = true;
  constructor(private _liveAnnouncer: LiveAnnouncer,
              private data: DataService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.fetchOutletData().then(() => {
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }
  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  async fetchOutletData() {
    this.size = parseFloat(await this.data.getResult('#outlets', 'print(#outlets)'));
    for (let i = 1; i <= this.size; i++) {
      const outletData:Outlet = {
        id: i,
        state: (await this.data.getResult(`outlets[${i}]:state`, `print(outlets[${i}]:getState())`)).includes('true'),
        voltage: parseFloat(await this.data.getResult(`outlets[${i}]:voltage`, `print(outlets[${i}]:getVoltage())`)),
        frequency: parseFloat(await this.data.getResult(`outlets[${i}]:frequency`, `print(outlets[${i}]:getFrequency())`)),
        current: parseFloat(await this.data.getResult(`outlets[${i}]:current`, `print(outlets[${i}]:getCurrent())`)),
        act_power: parseFloat(await this.data.getResult(`outlets[${i}]:act_power`, `print(outlets[${i}]:getActivePower())`)),
        app_power: parseFloat(await this.data.getResult(`outlets[${i}]:app_power`, `print(outlets[${i}]:getApparentPower())`)),
      };
      this.outlets.push(outletData);
      this.dataSource.data = [...this.outlets];
      if (i === this.pageSize) this.dataSource.paginator = this.paginator;
    }
    this.isLoading = false ;
  }

  saveItem(rowData: any) {
    this.editOutlet(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`Outlet  ${rowData.id} saved successfully`, 'Outlet Modification', 'done');
      })
      .catch(error => {
        this.notificationService.openToastr(`Failed to save data ${error}`,'Outlet Modification','error');
      });
  }
  async editOutlet(outlet: Outlet) {
    if (outlet != null) {
      const { id, voltage, frequency, current, act_power, app_power } = outlet;
      this.data.sendToGo(`
        outlets[${id}]:setVoltage(${voltage});
        outlets[${id}]:setFrequency(${frequency});
        outlets[${id}]:setCurrent(${current});
        outlets[${id}]:setActivePower(${act_power});
        outlets[${id}]:setApparentPower(${app_power});
        `);
      Object.entries(outlet).forEach(([key, value]) => this.data.editMap(`outlets[${id}]:${key}`, value as number | boolean));
    } else {
      throw new Error('outlet is null');
    }
  }

  cancelEdit() {
    this.editableRowIndex = -1;
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
  }

  calculateProgress(): number {
    return (this.dataSource.data.length / this.size ) * 100;
  }


}
