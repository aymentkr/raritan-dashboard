import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Peripheral, SensorElement } from '../../model/interfaces';
import { SensorService } from '../../services/sensor.service';

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  local_data: { type2: string; serial_number: string; type1: string } = {
    type1: '',
    type2: '',
    serial_number: ''
  };
  sensors: SensorElement[] = [];
  peripherals: Peripheral[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    ss: SensorService,
    // @Optional() is used to prevent an error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Peripheral[]
  ) {
    this.sensors = ss.getSensors();
    this.peripherals = data;
  }

  doAction() {
    const device: Peripheral | undefined = this.peripherals.find(device => device.serial_number === this.local_data.serial_number);
    this.local_data.type2 = <string>device?.type;
    this.dialogRef.close({ data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
