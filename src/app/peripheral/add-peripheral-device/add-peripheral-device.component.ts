import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Device, DeviceElement, SensorElement} from "../../model/interfaces";

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  selectedSensor!: SensorElement;
  selectedDevice: DeviceElement | undefined;
  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Device[]
  ) {}

  doAction() {
    this.dialogRef.close({ data: {
        type : this.selectedSensor.type,
        parent : this.selectedDevice,
      }});
  }

  closeDialog() {
    this.dialogRef.close();
  }

  isConditionMet(): boolean {
    return this.selectedSensor && this.data.length !== 0 && this.selectedSensor?.generation !== 1;
  }
  isFormValid(): boolean {
    if (this.isConditionMet()) {
      return this.selectedSensor != undefined && this.selectedDevice != undefined;
    } else {
      return this.selectedSensor != undefined;
    }
  }
  filterData() {
    return this.data = this.data.filter(dev => !dev.type.includes('DPX_'));
  }

}
