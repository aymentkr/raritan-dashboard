import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import { DeviceFlatNode} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {DataService} from "../services/data.service";
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
  myMap = new Map <string, DeviceFlatNode[]>;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('doorForm', {static: false}) doorForm!: NgForm;

  sensor: any;

  constructor(
    private data: DataService,
    private sp: SensorsPipe,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.myMap.set(`sensorports`, []);
    this.myMap.set(`envhubs`, []);
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
    const type = 'DX2_DH2C2';
    await this.initializeMap('sensorports');
    await this.initializeMap('envhubs');

    // Concatenate and filter the arrays
    const sensorPortDevices = this.myMap.get('sensorports') || [];
    const envHubDevices = this.myMap.get('envhubs') || [];
    return sensorPortDevices.concat(envHubDevices).filter((peripheral) => peripheral.type === type);
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
      for (const [key, deviceArray] of this.myMap.entries()) {
        const foundDevice = deviceArray?.find(device => device.device_id === selectedDeviceId);

        if (foundDevice) {
          if (enteredPin) {
            this.updateDevice(key, selectedDeviceId, selectedDoorNr, 'setPIN', enteredPin);
          }
          if (selectedDoorState) {
            this.updateDevice(key, selectedDeviceId, selectedDoorNr, 'setDoorState', selectedDoorState);
          }
          if (selectedHandleState) {
            this.updateDevice(key, selectedDeviceId, selectedDoorNr, 'setHandleState', selectedHandleState);
          }
          if (enteredId) {
            this.updateDevice(key, selectedDeviceId, selectedDoorNr, 'setCardId', enteredId);
          }
          this.notificationService.openToastr(`Device has been successfully updated (${key}), Virtual sensor operations for QEMU `, 'Device Modification ', 'done');
          break;
        }
      }
    } else {
      this.notificationService.openToastr('You need at least one field in the values are in order to apply a value modification!', 'Door Selection', 'error');
    }
  }

// New method for updating a device
  private updateDevice(key: string, selectedDeviceId: number, selectedDoorNr: number, operation: string, value: any) {
    const foundDevice = this.myMap.get(key)?.find(device => device.device_id === selectedDeviceId);
    if (foundDevice) {
      this.sp.callMethod(key, {
        methodName: `${operation}(${selectedDoorNr},${value})`,
        device: foundDevice,
      });
    }
  }

  private async initializeMap(table: string) {
    const size = parseFloat(await this.data.getResult('#' + table, `print(#${table})`));
    if (size === 1) {
      const lines = (await this.data.getResult(`${table}[1]:listDevices`, `print(${table}[1]:listDevices())`)).split('\n');
      this.myMap.get(table)?.push(...this.sp.convertLinesToDevices(lines));
    }
  }
}
