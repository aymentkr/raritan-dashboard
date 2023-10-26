import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SensorElement } from '../../model/interfaces';
import {SensorsPipe} from "../../pipes/sensors.pipe";

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  type ='';

  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  doAction() {
    this.dialogRef.close({ data: this.type });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
