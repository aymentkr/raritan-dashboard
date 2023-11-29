import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Device, DeviceElement, SensorElement} from "../../model/interfaces";

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  device1!: DeviceElement;
  device2: DeviceElement | undefined;
  selectedSensor: SensorElement | undefined;
  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Device[]
  ) {}

  doAction() {
    this.dialogRef.close({ data: {
        type : this.device1.type,
        parent : this.device2,
      }});
  }

  closeDialog() {
    this.dialogRef.close();
  }

  isFormValid1(): boolean {
    return this.device1 != undefined;
  }
}
