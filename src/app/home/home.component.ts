import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Envhub, Peripheral} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorService} from "../services/sensor.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {AddToEnvhubComponent} from "./add-to-envhub/add-to-envhub.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit{
  displayedColumns: string[] = ['id', 'name', 'type', 'serial_number'];
  state!: boolean;
  dataSource: MatTableDataSource<Peripheral>[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
      private dialog: MatDialog,
      private ss: SensorService,
      private cdr: ChangeDetectorRef,
      private _snackBar: MatSnackBar,
      private dataService: DataService
  ) {}

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
    const dialogRef = this.dialog.open(AddToEnvhubComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.addRowData(result.data,i);
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

  async addRowData(type: string, p: number ) {
    if (type != '' ) {
      await this.ss.saveToEnvhubs(type, p);
      this.fetchData();
      this._snackBar.open(`New Devic with type ${type} in Port ${p} saved successfully`, 'OK', {
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
    this.ss.callMethodinEnvhubs(data);
    this._snackBar.open(`Device has been successfully updated`, 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  public infoDevice = (obj: Peripheral): void => {
    this.ss.infoDevice(obj);
  };
    getDataSourceLengths(): number[] {
        return this.dataSource.map((item) => item.data.length);
    }

  setFuseState(i: number) {
      if (this.state){
        this.ss.setFuseState(i,this.state);
        this._snackBar.open(`State in Port ${i} has been successfully updated`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      } else  {
        this._snackBar.open('You have to select an option first', 'OK', {
        duration: 3000,
            panelClass: ['error-snackbar'],
      });
      }
  }
}
