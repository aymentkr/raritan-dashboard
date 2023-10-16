import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Envhub, Peripheral} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorService} from "../services/sensor.service";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {NotificationService} from "../services/notification.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";

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
      private notificationService: NotificationService,
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
    const dialogRef = this.dialog.open(AddPeripheralDeviceComponent);

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
      this.notificationService.openToastr(`New Device with type ${type} in Port ${p} saved successfully`, 'Adding Device to Envhubs','done');
    } else {
      this.notificationService.openToastr('Failed to save data','Adding Device to Envhubs','error');
    }
  }


  private editRowData(data: any) {
    this.ss.callMethodinEnvhubs(data);
    this.notificationService.openToastr('Device has been successfully updated (Envhubs), Virtual sensor operations for QEMU ','Device Modification ','done')
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
        this.notificationService.openToastr(`Fuse State in Port ${i} has been successfully updated`, `Envhubs: Modification in Port ${i}`, 'done');
      } else  {
        this.notificationService.openToastr('You have to select an option first','Envhubs : setFuseState(true/false)','info')
      }
  }
}
