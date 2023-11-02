import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
export class OutletComponent implements OnInit,AfterViewInit,OnDestroy {
  dataSource = new MatTableDataSource<Outlet>();
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
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;
  pageSizeOptions: number[] = [5,10, 15,20, 30,35,40];
  pageSize: number = 10;
  editableRowIndex: number = -1;
  isLoading: boolean = true;
  constructor(private _liveAnnouncer: LiveAnnouncer,
              private data: DataService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef
  ) {
  }
  ngOnInit(): void {
    this.fetchOutletData()
      .then((data: Outlet[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.cdRef.detectChanges();
  }
  ngOnDestroy(): void {
    this.data.close();
  }

  async fetchOutletData(): Promise<Outlet[]> {
    const outlets: Outlet[] = [];
    const fetchOutletDataRecursive = async (): Promise<void> => {
      const index = parseFloat(await this.data.getResult('#outlets', 'print(#outlets)'));
      if (isNaN(index)) {
        return fetchOutletDataRecursive();
      } else {
        for (let i = 1; i <= index; i++) {
          const state = await this.data.getResult(`outlets[${i}]:getState()`, `print(outlets[${i}]:getState())`);
          const voltage = parseFloat(await this.data.getResult(`outlets[${i}]:getVoltage()`, `print(outlets[${i}]:getVoltage())`));
          const frequency = parseFloat(await this.data.getResult(`outlets[${i}]:getFrequency()`, `print(outlets[${i}]:getFrequency())`));
          const current = parseFloat(await this.data.getResult(`outlets[${i}]:getCurrent()`, `print(outlets[${i}]:getCurrent())`));
          const act_power = parseFloat(await this.data.getResult(`outlets[${i}]:getActivePower()`, `print(outlets[${i}]:getActivePower())`));
          const app_power = parseFloat(await this.data.getResult(`outlets[${i}]:getApparentPower()`, `print(outlets[${i}]:getApparentPower())`));
          outlets.push({
            id: i,
            state: state.includes('true'),
            voltage: voltage,
            frequency: frequency,
            current: current,
            act_power: act_power,
            app_power: app_power,
          });
          console.log(outlets)
        }
      }
    }
    await fetchOutletDataRecursive();
    return outlets;
  }

  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
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
    if (outlet!=null) {
      this.data.sendToGo(`outlets[${outlet.id}]:setVoltage(${outlet.voltage});`);
      this.data.sendToGo(`outlets[${outlet.id}]:setFrequency(${outlet.frequency});`);
      this.data.sendToGo(`outlets[${outlet.id}]:setCurrent(${outlet.current});`);
      this.data.sendToGo(`outlets[${outlet.id}]:setActivePower(${outlet.act_power});`);
      this.data.sendToGo(`outlets[${outlet.id}]:setApparentPower(${outlet.app_power});`);
    } else {
      throw new Error('outlet is null');
    }
  }


  cancelEdit() {
    this.editableRowIndex = -1; // Exit edit mode
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


}
