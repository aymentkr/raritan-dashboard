import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {AddPeripheralDeviceComponent} from "./add-peripheral-device/add-peripheral-device.component";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Peripheral} from "../model/interfaces";
import {SensorService} from "../services/sensor.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "./edit-peripheral-device/edit-peripheral-device.component";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
})
export class PeripheralComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Peripheral>();
  displayedColumns: string[] = ['select', 'id', 'name', 'type', 'serial_number', 'actions'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private dialog: MatDialog,
    private ss: SensorService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private dataService: DataService
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  fetchData() {
    this.dataService.fetchPeripheralData()
      .then((data: Peripheral[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  addDevice() {
    const dialogRef = this.dialog.open(AddPeripheralDeviceComponent, {
      data: this.dataSource.data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.addRowData(result.data);
    });
  }

  editDevice(obj: Peripheral) {
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  async addRowData(obj: any) {
    if (obj.type1 != "" && obj.type2 != "" && obj.serial_number.length == 10 && await this.ss.save(obj)) {
      this.fetchData();
      this._snackBar.open(`New Device ${obj.serial_number} saved successfully`, 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } else {
      this._snackBar.open('Failed to save data', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  private editRowData(data: any) {
    this.ss.callMethod(data);
    this._snackBar.open(`Device has been successfully updated`, 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  public infoDevice = (obj: Peripheral): void => {
    let selectedSensor = this.ss.getSensors().find(sensor => sensor.type === obj.type);
    if (selectedSensor) {
      const formattedMethods = selectedSensor.methods.join('\n'); // Format methods as a list

      Swal.fire({
        title: 'Peripheral Device ID: ' + obj.id,
        html: '<mark>' + 'Methods:' + '</mark>' + '<pre>' + formattedMethods + '</pre>', // Display methods in a <pre> element for better formatting
        icon: 'info'
      });
    } else {
      // Handle the case when the sensor is not found
      Swal.fire('Peripheral Device ID: ' + obj.id, 'Sensor not found', 'error');
    }
  };


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

  removeAllItems() {
    Swal.fire({
      title: 'Are you sure?',
      text: "you want to remove all devices?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ss.removeAll();
        this.fetchData();
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      }
    })
  }
}
