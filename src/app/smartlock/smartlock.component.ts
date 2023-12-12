import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import { DeviceFlatNode} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {NgForm} from "@angular/forms";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-smartlock',
  templateUrl: './smartlock.component.html',
  styleUrls: ['./smartlock.component.css']
})
export class SmartlockComponent implements OnInit {
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<DeviceFlatNode>();
  columns: string[] = ['device_id', 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select', ...this.columns];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('doorForm', {static: false}) doorForm!: NgForm;

  sensor: any;

  constructor(
    private sp: SensorsPipe,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.sensor = sp.filterSensorsByType('DX2_DH2C2');
  }

  ngOnInit(): void {
    this.fetchSmartLockData()
      .then((data: DeviceFlatNode[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.cdr.detectChanges()
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchSmartLockData(): Promise<DeviceFlatNode[]> {
    const list:DeviceFlatNode[] = [];
    const type = 'DX2_DH2C2';
    this.sp.deviceMap.forEach(value => {
      if (value.type === type) {
        list.push(value)
      }
    })
    return list;
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

  onFormSubmit(doorForm: NgForm) {
    const selectedDoorNr = doorForm.value.doorNr;
    const selectedDeviceId = doorForm.value.deviceId;
    const selectedHandleState = doorForm.value.handleState;
    const selectedDoorState = doorForm.value.doorState;
    const enteredId = doorForm.value.id;
    const enteredPin = doorForm.value.pin;

    if (selectedHandleState || selectedDoorState || enteredId || enteredPin) {
      const foundDevice = this.dataSource.data.find(device => device.device_id === selectedDeviceId);
      if (foundDevice) {
        if (enteredPin) {
          this.sp.callMethod({
            methodName: `setPIN(${selectedDoorNr},${enteredPin})`,
            device: foundDevice,
          });
        }
        if (selectedDoorState) {
          this.sp.callMethod({
            methodName: `setDoorState(${selectedDoorNr},${selectedDoorState})`,
            device: foundDevice,
          });
        }
      }
      if (selectedHandleState) {
        this.sp.callMethod({
          methodName: `setHandleState(${selectedDoorNr},${selectedHandleState})`,
          device: foundDevice,
        });
      }
      if (enteredId) {
        this.sp.callMethod({
          methodName: `setCardId(${selectedDoorNr},${enteredId})`,
          device: foundDevice,
        });
      }
      this.notificationService.openToastr(`Device has been successfully updated (${selectedDeviceId}), Virtual sensor operations for QEMU `, 'Device Modification ', 'done');
    } else {
      this.notificationService.openToastr('You need at least one field in the values are in order to apply a value modification!', 'Door Selection', 'error');
    }
  }

}
