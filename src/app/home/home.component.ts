import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Envhub, Peripheral} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {MatDialog} from "@angular/material/dialog";
import {SensorService} from "../services/sensor.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DataService} from "../services/data.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import Swal from "sweetalert2";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit{
  displayedColumns: string[] = ['id', 'name', 'type', 'serial_number'];
  dataSource: MatTableDataSource<Peripheral>[] = [];
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
    this.dataService
      .fetchEnvhubsData()
      .then((data: Envhub) => {
        for (let i = 0; i < 4; i++) {
          if (data[i]) {
            this.dataSource[i] = new MatTableDataSource<Peripheral>(data[i]);
          }
        }
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  addDevice(i:number) {
    const dialogRef = this.dialog.open(AddPeripheralDeviceComponent, {
      data: this.dataSource[i].data
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
    getDataSourceLengths(): number[] {
        return this.dataSource.map((item) => item.data.length);
    }

}
