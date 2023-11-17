import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Peripheral, Device} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {NotificationService} from "../services/notification.service";
import {DataService} from "../services/data.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {PeripheralClass} from "../model/PeripheralClass";
import {DeleteDeviceDialogComponent} from "../peripheral/delete-device-dialog/delete-device-dialog.component";

@Component({
  selector: 'app-envhub',
  templateUrl: './envhub.component.html',
  styleUrls: ['./envhub.component.css']
})
export class EnvhubComponent implements OnInit{
  isLoading: boolean = true;
  columns: string[] = ['device_id', 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select' ,...this.columns,'actions']
  state!: boolean;
  dataSource: MatTableDataSource<Device>[] = [];
  selection: SelectionModel<Device>[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private sp: SensorsPipe,
    public Peripheral: PeripheralClass,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private data: DataService
  ) {}

  ngOnInit(): void {
    this.fetchEnvhubsData()
      .then(() => {
        this.cdr.detectChanges();
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchEnvhubsData() {
    const size = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));
    if (size === 1) {
      for (let i = 0; i < 4; i++) {
        const lines = (await this.data.getResult(`envhubs[1]:getPort(${i}):listDevices`, `print(envhubs[1]:getPort(${i}):listDevices())`)).split('\n');
        this.dataSource[i] = new MatTableDataSource<Device>(this.sp.convertLinesToDevices(lines));
        this.dataSource[i].sort = this.sort;
        this.selection.push(new SelectionModel<Device>(true, []));
      }
    }
  }


  addDevice(i:number) {
    this.isEmpty().then(_bool => {
      if (_bool)
        this.notificationService.openToastr("Sorry! You can't add any virtual peripheral device in QEMU currently :(", 'Adding Device to Sensorports', 'info');
      else {
        const dialogRef = this.dialog.open(AddPeripheralDeviceComponent);
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.addRowData(result.data, i);
        });
      }
    })
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
      this.selection[p].clear();
      this.sp.saveDevice('envhubs[1]:getPort(' + p + ')', type);
      this.data.removeMap(`envhubs[1]:getPort(${p}):listDevices`);
      const lines = (await this.data.getResult(`envhubs[1]:getPort(${p}):listDevices`, `print(envhubs[1]:getPort(${p}):listDevices())`)).split('\n');
      this.dataSource[p].data = this.sp.convertLinesToDevices(lines);
      this.dataSource[p]._updateChangeSubscription();
      this.notificationService.openToastr(`New Device with type ${type} in Port ${p} saved successfully`, 'Adding Device to Envhubs','done');
    } else {
      this.notificationService.openToastr('Failed to save data','Adding Device to Envhubs','error');
    }
  }

  private editRowData(data: any) {
    this.sp.callMethod('envhubs[1]',data);
    this.notificationService.openToastr('Device has been successfully updated (Envhubs), Virtual sensor operations for QEMU ','Device Modification ','done')
  }

  public infoDevice = (obj: Device): void => {
    this.sp.infoDevice(obj);
  };
  setFuseState(i: number) {
    if (this.state){
      this.sp.setFuseState(i,this.state);
      this.notificationService.openToastr(`Fuse State in Port ${i} has been successfully updated`, `Envhubs: Modification in Port ${i}`, 'done');
    } else  {
      this.notificationService.openToastr('You have to select an option first','Envhubs : setFuseState(true/false)','info')
    }
  }
  masterToggle(i: number) {
    this.isAllSelected(i)
      ? this.selection[i].clear()
      : this.dataSource[i].data.forEach((row) => this.selection[i].select(row));
  }

  isAllSelected(i: number) {
    const numSelected = this.selection[i].selected.length;
    const numRows = this.dataSource[i].data.length;
    return numSelected === numRows;
  }

  deleteSelectedItems(i: number) {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '250px',
      data: {
        isAllSelected: this.isAllSelected(i),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.data.removeMap(`envhubs[1]:getPort(${i}):listDevices`);
        if (this.isAllSelected(i)) {
          this.sp.removeAll(`envhubs[1]:getPort(${i})`);
          this.dataSource[i].data = [];
          this.dataSource[i]._updateChangeSubscription();
        } else {
          const selectedItems = this.selection[i].selected;
          selectedItems.forEach((item: Device) => {
            const index = this.dataSource[i].data.indexOf(item);
            if (index !== -1) {
              this.sp.removeDevice('envhubs[1]', item.serial_number);
              this.dataSource[i].data.splice(index, 1);
              this.dataSource[i]._updateChangeSubscription();
            }
          });
        }
        this.selection[i].clear();
        if (this.isAllSelected(i)) {
          this.notificationService.openToastr('All devices deleted successfully from Envhubs', 'Deleting Devices', 'warning');
        } else {
          this.notificationService.openToastr('Selected device(s) deleted successfully from Envhubs', 'Deleting Devices', 'warning');
        }
      }
    });
  }


  async isEmpty(): Promise<boolean> {
    return await this.sp.getLength('envhubs') == 0;
  }

}
