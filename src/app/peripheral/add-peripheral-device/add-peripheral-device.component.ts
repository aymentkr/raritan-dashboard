import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeviceNode, SensorElement } from "../../model/interfaces";

@Component({
  selector: 'app-add-peripheral-device',
  templateUrl: './add-peripheral-device.component.html',
  styleUrls: ['./add-peripheral-device.component.css']
})
export class AddPeripheralDeviceComponent {
  selectedSensor!: SensorElement;

  constructor(
    public dialogRef: MatDialogRef<AddPeripheralDeviceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DeviceNode[]
  ) {}

  doAction() {
    const index = this.data.findIndex(item => !item.type.includes('DPX_'));
    this.dialogRef.close({
      data: {
        type: this.selectedSensor.type,
        lastChild: index !== -1 ? this.getLastChild(this.data[index]) : undefined
      }
    });
  }


  closeDialog() {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    return this.selectedSensor !== undefined;
  }

  private getLastChild(item: DeviceNode): DeviceNode | undefined {
    return item.tailports?.length ? this.getLastChild(item.tailports[0]) : item;
  }


}
