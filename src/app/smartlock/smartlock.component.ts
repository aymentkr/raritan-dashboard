import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Device} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {DataService} from "../services/data.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-smartlock',
  templateUrl: './smartlock.component.html',
  styleUrls: ['./smartlock.component.css']
})
export class SmartlockComponent implements OnInit{
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<Device>();
  columns : string[] = [ 'device_id','name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select', ...this.columns];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('doorForm1', { static: false }) doorForm1!: NgForm;
  @ViewChild('doorForm2', { static: false }) doorForm2!: NgForm;

  sensor: any ;
  deviceIds: number[] = [];

  constructor(
    private data: DataService,
    private sp: SensorsPipe,
    private cdr: ChangeDetectorRef,
  ) {
    this.sensor = sp.filterSensorsByType('DX2_DH2C2');
  }

  ngOnInit(): void {
    this.fetchSmartLockData()
      .then((data: Device[]) => {
        this.dataSource.data = data;
        data.forEach(value => {
          this.deviceIds.push(value.device_id);
        })
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
    const peripherals: Device[] = [];
    const sizeP = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    const sizeE = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));
    if (sizeP !== 0) {
      const lines = (await this.data.getResult('sensorports[1]:listDevices', 'print(sensorports[1]:listDevices())')).split('\n');
      peripherals.push(...this.sp.convertLinesToDevices(lines));
    }
    if (sizeE !== 0) {
      for (let i = 0; i < 4; i++) {
        const lines = (await this.data.getResult(`envhubs[1]:getPort(${i}):listDevices`, `print(envhubs[1]:getPort(${i}):listDevices())`)).split('\n');
        peripherals.push(...this.sp.convertLinesToDevices(lines));
      }
    }
    return peripherals.filter((peripheral) => peripheral.type === type);
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
    if (doorForm.valid) {
      const selectedDeviceId = doorForm.value.deviceId;
      const selectedState = doorForm.value.state;
      const enteredPin = doorForm.value.pin;

      if (doorForm === this.doorForm1) {
        // Logic for Form 1
        console.log('Handling Form 1 submission');
      } else  {
        console.log('Handling Form 2 submission');
      }

      // Your common logic here
      console.log('Selected Device ID:', selectedDeviceId);
      console.log('Selected State:', selectedState);
      console.log('Entered PIN:', enteredPin);
    } else {
      // Handle the case when the form is not valid
      console.log('Form is not valid');
    }
  }
}
