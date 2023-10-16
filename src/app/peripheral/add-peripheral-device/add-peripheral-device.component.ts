import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SensorElement } from '../../model/interfaces';
import { SensorService } from '../../services/sensor.service';

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  sensors: SensorElement[] = [];
  type ='';

  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    ss: SensorService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.sensors = ss.getSensors();
  }

  doAction() {
    this.dialogRef.close({ data: this.type });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
