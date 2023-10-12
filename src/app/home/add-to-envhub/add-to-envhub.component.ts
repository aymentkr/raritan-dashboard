import {Component, Inject, Optional} from '@angular/core';
import {SensorElement} from "../../model/interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SensorService} from "../../services/sensor.service";

@Component({
  selector: 'app-add-to-envhub',
  templateUrl: './add-to-envhub.component.html',
  styleUrls: ['./add-to-envhub.component.css']
})
export class AddToEnvhubComponent {
  sensors: SensorElement[] = [];
  type ='';

  constructor(
      public dialogRef: MatDialogRef<AddToEnvhubComponent>,
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
