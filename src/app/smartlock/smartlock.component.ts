import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Peripheral} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorService} from "../services/sensor.service";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-smartlock',
  templateUrl: './smartlock.component.html',
  styleUrls: ['./smartlock.component.css']
})
export class SmartlockComponent implements OnInit, AfterViewInit{
  dataSource = new MatTableDataSource<Peripheral>();
  columns : string[] = [ 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select', ...this.columns, ];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  sensor: any ;

  constructor(
    private dialog: MatDialog,
    private ss: SensorService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private dataService: DataService
  ) {
    this.sensor = this.ss.getSensors().find(sensor => sensor.type === 'DX2_DH2C2')
  }

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  fetchData() {
    this.dataService.fetchSmartLockData()
      .then((data: Peripheral[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
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

}
