import { Component, Inject, Optional } from '@angular/core';
import {Asset} from "../../model/interfaces";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent {
  isExt :boolean;
  title='';desc1='';desc2='';desc3='';desc4='';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {
    this.isExt = data;
    if  (!this.isExt) {
      this.title = 'Connects a Virtual Asset Tag to this Asset Strip';
      this.desc2 = 'Tag ID will consist of bytes id1 (MSB) and id2 (LSB)';
      this.desc3 = 'If custom=true, tag will be programmable';
    } else {
      this.title = 'Connects a Virtual Blade Extension to this Asset Strip';
      this.desc1 = 'size - number of blade extension slots to emulate';
      this.desc2 = `id1 and id2 - blade extension is itself a "tag" and has its own ID`;
      this.desc3 = `If custom=true, blade extension's ID will be user-programmable`;
    }

    this.form = this.fb.group({
      rackunit: [null, [Validators.required, Validators.min(1)]],
      slot: [null, [Validators.min(0)]],
      size: [null, [Validators.min(1)]],
      id1: [null, [Validators.required, Validators.min(1)]],
      id2: [null, [Validators.required, Validators.min(1)]],
      custom: [false]
    });
  }

  doAction() {
    // Check if the form is valid
    if (this.form.valid) {
      // Extract form data
      const formData = this.form.value;

      // Extract common fields
      const rackunit = formData.rackunit;
      const id1 = formData.id1;
      const id2 = formData.id2;
      const custom = formData.custom;

      // Create the info object based on the presence of 'slot' or 'size'
      const info: Asset = formData.slot
        ? { rackunit, slot: formData.slot, id1, id2, custom }
        : { rackunit, size: formData.size, id1, id2, custom };

      // Close the dialog with the info data
      this.dialogRef.close({ data: info });
    }
  }



  closeDialog() {
    this.dialogRef.close();
  }
}
