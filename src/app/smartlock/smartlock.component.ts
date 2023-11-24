import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Device} from "../model/interfaces";
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
  dataSource = new MatTableDataSource<Device>();
  columns: string[] = ['device_id', 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select', ...this.columns];
  myMap = new Map <string, Device[]>;
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
    this.sensor = sp.filterSensorsByType('DX2_DH2C2');
  }

  ngOnInit(): void {
    this.fetchSmartLockData()
      .then((data: Device[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.cdr.detectChanges()
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchSmartLockData() {
    const type = 'DX2_DH2C2';
    const sizeP = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    const sizeE = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));

    // Initialize the map once outside the condition
    this.myMap.set('sensorports[1]', []);

    if (sizeP !== 0) {
      const lines = (await this.data.getResult('sensorports[1]:listDevices', 'print(sensorports[1]:listDevices())')).split('\n');
      this.myMap.get('sensorports[1]')?.push(...this.sp.convertLinesToDevices(lines));
    }

    // Initialize the map once outside the loop
    this.myMap.set('envhubs[1]', []);

    if (sizeE !== 0) {
      for (let i = 0; i < 4; i++) {
        const lines = (await this.data.getResult(`envhubs[1]:getPort(${i}):listDevices`, `print(envhubs[1]:getPort(${i}):listDevices())`)).split('\n');
        this.myMap.get('envhubs[1]')?.push(...this.sp.convertLinesToDevices(lines));
      }
    }

    // Concatenate and filter the arrays
    return this.myMap.get('sensorports[1]')?.concat(this.myMap.get('envhubs[1]') || [])?.filter((peripheral) => peripheral.type === type) || [];
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
      // Iterate over the keys in myMap
      for (const key of this.myMap.keys()) {
        const deviceArray = this.myMap.get(key);
        // Find the device based on deviceId
        const foundDevice = deviceArray?.find(device => device.device_id === selectedDeviceId);
        if (foundDevice) {
          if (enteredPin) {
            this.sp.callMethod(key, {
              methodName: `setPIN(${selectedDoorNr},${enteredPin})`,
              device: foundDevice,
            });
            console.log('hi');
          }
          if (selectedDoorState) {
            console.log('hi');
            this.sp.callMethod(key, {
              methodName: `setDoorState(${selectedDoorNr},${selectedDoorState})`,
              device: foundDevice,
            });
          }
          if (selectedHandleState) {
            this.sp.callMethod(key, {
              methodName: `setHandleState(${selectedDoorNr},${selectedHandleState})`,
              device: foundDevice,
            });
            console.log('hi');
          }
          if (enteredId) {
            console.log('hi');
            this.sp.callMethod(key, {
              methodName: `setCardId(${selectedDoorNr},${enteredId})`,
              device: foundDevice,
            });
          }
          this.notificationService.openToastr(`Device has been successfully updated (${key}), Virtual sensor operations for QEMU `,'Device Modification ','done')
          break;
        }
      }
    } else {
      this.notificationService.openToastr('You need at least one field in the values are in order to apply a value modification!','Door Selection','error')
    }
  }
}
