import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-device-dialog',
  templateUrl: './delete-device-dialog.component.html',
  styleUrls: ['./delete-device-dialog.component.css']
})
export class DeleteDeviceDialogComponent {
  msgContent ='';

  constructor(private dialogRef: MatDialogRef<DeleteDeviceDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.msgContent = data;
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
