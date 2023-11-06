import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Peripheral} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {NotificationService} from "../services/notification.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {SelectionModel} from "@angular/cdk/collections";
import Swal from "sweetalert2";
import {SensorsPipe} from "../pipes/sensors.pipe";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  isLoading: boolean = true;
  columns: string[] = ['id', 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select' ,...this.columns,'actions']
  state!: boolean;
  dataSource: MatTableDataSource<Peripheral>[] = [];
  selection: SelectionModel<Peripheral>[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
      private dialog: MatDialog,
      private sp: SensorsPipe,
      private cdr: ChangeDetectorRef,
      private notificationService: NotificationService,
      private data: DataService
  ) {}

  ngOnInit(): void {
    this.fetchEnvhubsData()
      .then(() => {
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchEnvhubsData() {
    const fetchEnvhubsDataRecursive = async (): Promise<void> => {
      const size = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));
      if (isNaN(size)) {
        setTimeout(() => {
          fetchEnvhubsDataRecursive();
        }, 0);
      } else {
        for (let i = 0; i < 4; i++) {
          const lines = (await this.data.getResult(`envhubs[1]:getPort(${i}):listDevices`, `print(envhubs[1]:getPort(${i}):listDevices())`)).split('\n');
          this.dataSource[i] = new MatTableDataSource<Peripheral>(this.sp.convertLinesToPeripherals(lines));
          this.dataSource[i].sort = this.sort;
          this.selection.push(new SelectionModel<Peripheral>(true, []));
        }
        this.isLoading = false;
      }
    }
    await fetchEnvhubsDataRecursive();
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
      const length = this.dataSource[p].data.length + 1
      this.selection[p].clear();
      this.sp.saveDevice('envhubs[1]:getPort(' + p + ')', type);
      const fetchEnvhubDataRecursive = async (): Promise<void> => {
        const lines = (await this.data.getResult(`envhubs[1]:getPort(${p}):listDevices`, `print(envhubs[1]:getPort(${p}):listDevices())`)).split('\n');
        if (length === lines.length-1) {
          this.dataSource[p].data = this.sp.convertLinesToPeripherals(lines);
          this.dataSource[p]._updateChangeSubscription();
          this.notificationService.openToastr(`New Device with type ${type} in Port ${p} saved successfully`, 'Adding Device to Envhubs','done');
        } else {
          setTimeout(() => {
            fetchEnvhubDataRecursive();
          }, 10);
        }
      }
      await fetchEnvhubDataRecursive()
    } else {
      this.notificationService.openToastr('Failed to save data','Adding Device to Envhubs','error');
    }
  }

  private editRowData(data: any) {
    this.sp.callMethod('envhubs[1]',data);
    this.notificationService.openToastr('Device has been successfully updated (Envhubs), Virtual sensor operations for QEMU ','Device Modification ','done')
  }

  public infoDevice = (obj: Peripheral): void => {
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
    const selectedItems = this.selection[i].selected;
    let title, text: string;

    if (this.isAllSelected(i)) {
      title = 'Are you sure?';
      text = 'you want to remove all devices?';
    } else {
      title = 'Are you sure?';
      text = 'You want to remove the selected device(s)?';
    }

    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.isAllSelected(i)) {
          this.sp.removeAll(`envhubs[1]:getPort(${i})`);
          setTimeout(() => {
            this.dataSource[i].data = [];
            this.dataSource[i]._updateChangeSubscription();
          },1000)
        } else {
          selectedItems.forEach((item: Peripheral) => {
            const index = this.dataSource[i].data.indexOf(item);
            if (index !== -1) {
              this.sp.removeDevice('envhubs[1]', item);
              setTimeout(() => {
                this.dataSource[i].data.splice(index, 1);
                this.dataSource[i]._updateChangeSubscription();
              },1000)
            }
          });
        }
        this.selection[i].clear();
        if (this.isAllSelected(i)) {
          Swal.fire(
            'Deleted!',
            'All devices deleted successfully',
            'success'
          )
          this.notificationService.openToastr('All devices deleted successfully from Envhubs', 'Deleting Devices', 'warning');
        } else {
          Swal.fire(
            'Deleted!',
            'Selected device(s) deleted successfully',
            'success'
          )
          this.notificationService.openToastr('Selected device(s) deleted successfully from Envhubs', 'Deleting Devices', 'warning');
        }
      }
    });
  }


  async isEmpty(): Promise<boolean> {
    return await this.sp.getLength('envhubs') == 0;
  }

}
