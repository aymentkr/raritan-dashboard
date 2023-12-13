import { Component, Inject, Optional } from '@angular/core';
import {Asset} from "../../model/interfaces";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {AssetsPipe} from "../../pipes/assets.pipe";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent {
  isExt :boolean;
  title='';desc1='';desc2='';desc3='';
  form: FormGroup;
  extensionSlots: number[] = Array.from({ length: 16 }, (_, i) => i + 1);

  constructor(
    private ap:AssetsPipe,
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
      this.title = 'Connects a Virtual Blade Extensizesion to this Asset Strip';
      this.desc1 = 'size - number of blade extension slots to emulate';
      this.desc2 = `id1 and id2 - blade extension is itself a "tag" and has its own ID`;
      this.desc3 = `If custom=true, blade extension's ID will be user-programmable`;
    }

    this.form = this.fb.group({
      slot: [null, this.isExt ? [] : Validators.required],
      size: [null, this.isExt ? [Validators.required, Validators.min(1)] : []],
      id1: [{ value: this.generateRandomAssetId(), disabled:true}, [Validators.required, Validators.min(1), Validators.max(12)]],
      id2: [{ value: this.generateRandomAssetId(), disabled:true}, [Validators.required, Validators.min(1), Validators.max(12)]],
      custom: [false]
    });

// Subscribe to changes in custom
    this.form.get('custom')!.valueChanges.subscribe((customValue: boolean) => {
      if (!customValue) {
        // If custom is false, disable id1 and id2
        this.form.get('id1')!.disable({ emitEvent: false });
        this.form.get('id2')!.disable({ emitEvent: false });
      } else {
        // If custom is true, enable id1 and id2
        this.form.get('id1')!.enable({ emitEvent: false });
        this.form.get('id2')!.enable({ emitEvent: false });
      }
    });
  }
  doAction() {
    // Extract form controls
    const id1Control = this.form.get('id1');
    const id2Control = this.form.get('id2');

    if (id1Control && id2Control) {
      // Extract values
      const id1 = id1Control.value;
      const id2 = id2Control.value;

      // Create the info object based on the presence of 'slot' or 'size'
      const asset: Asset = this.isExt
        ? { rackunit: this.ap.IncRackunit(), size: this.form.get('size')?.value, id1, id2, custom: this.form.get('custom')?.value }
        : { rackunit: this.ap.IncRackunit(), slot: this.form.get('slot')?.value, id1, id2, custom: this.form.get('custom')?.value };

      // Close the dialog with the info data
      this.dialogRef.close({ data: asset });
    }
  }



  generateRandomAssetId(): string {
    const maxLength = 12;

    // Choose a random length between 1 and 12
    const length = Math.floor(Math.random() * maxLength) + 1;

    const characters = '0123456789ABCDEF';
    let randomId = '';

    // Generate random characters up to the chosen length
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
    }

    // Fill the rest with '0' until the length reaches 12
    randomId = '0'.repeat(maxLength - randomId.length) + randomId;

    return randomId;
  }



  closeDialog() {
    this.dialogRef.close();
  }
}
