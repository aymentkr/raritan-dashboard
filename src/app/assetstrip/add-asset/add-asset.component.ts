import { Component, Inject, Optional } from '@angular/core';
import { Asset } from "../../model/interfaces";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent {
  title = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Asset
  ) {
    this.title = `Connects a Virtual ${data.type} to this Asset Strip`;

    // Initialize the form with FormBuilder
    this.form = this.fb.group({
      rackunit: [null, [Validators.required, Validators.min(1)]],
      slot: [null, [Validators.required, Validators.min(1)]],
      id1: [null, [Validators.required, Validators.min(1)]],
      id2: [null, [Validators.required, Validators.min(1)]],
      custom: [false]
    });
  }

  doAction() {

  }

  closeDialog() {
    this.dialogRef.close();
  }
}
