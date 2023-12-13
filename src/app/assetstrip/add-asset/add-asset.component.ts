import {Component, Inject, Optional} from '@angular/core';
import {Asset} from "../../model/interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssetsPipe} from "../../pipes/assets.pipe";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent {
  isExt: boolean;
  title = '';
  desc1 = '';
  desc2 = '';
  desc3 = '';
  form: FormGroup;
  extensionSlots: number[] = Array.from({length: 16}, (_, i) => i + 1);
  id1 = 0;
  id2 = 0;
  AssetID='';

  constructor(
    private ap: AssetsPipe,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {
    this.isExt = data;
    if (!this.isExt) {
      this.title = 'Connects a Virtual Asset Tag to this Asset Strip';
      this.desc2 = 'Tag ID will consist of bytes id1 (MSB) and id2 (LSB)';
      this.desc3 = 'If custom=true, tag will be programmable';
    } else {
      this.title = 'Connects a Virtual Blade Extensizesion to this Asset Strip';
      this.desc1 = 'size - number of blade extension slots to emulate';
      this.desc2 = `id1 and id2 - blade extension is itself a "tag" and has its own ID`;
      this.desc3 = `If custom=true, blade extension's ID will be user-programmable`;
    }
    this.generateID();
    this.form = this.fb.group({
      slot: [null, this.isExt ? [] : Validators.required],
      size: [null, this.isExt ? [Validators.required, Validators.min(1)] : []],
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false]
    });
// Subscribe to changes in custom
    this.form.get('custom')!.valueChanges.subscribe((customValue: boolean) => {
      if (customValue) {
        this.AssetID='';
        this.id1 = this.form.get('id1')?.value ?? 0;
        this.id2 = this.form.get('id2')?.value ?? 0;
      }
    });

    this.form.get('id1')!.valueChanges.subscribe(() => {
      this.AssetID = convertToAssetId(this.id1, this.id2);
    });
    this.form.get('id2')!.valueChanges.subscribe(() => {
      this.AssetID = convertToAssetId(this.id1, this.id2);
    });
  }

  doAction() {
    if (this.AssetID !== '') {
      // Create the info object based on the presence of 'slot' or 'size'
      const asset: Asset = this.isExt
        ? {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID,
          size: this.form.get('size')?.value,
          id1: this.id1,
          id2: this.id2,
          custom: this.form.get('custom')?.value
        }
        : {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID,
          slot: this.form.get('slot')?.value,
          id1: this.id1,
          id2: this.id2,
          custom: this.form.get('custom')?.value
        };

      // Close the dialog with the info data
      this.dialogRef.close({data: asset});
    }
  }

  generateRandomBytes(): [number, number] {
    const generateRandomByte = (): number => Math.floor(Math.random() * 256);

    const isDuplicate = (value: number): boolean =>
      this.ap.tags.some(tag => tag.id1 === value || tag.id2 === value) ||
      this.ap.extensions.some(ext => ext.id1 === value || ext.id2 === value);

    let msb: number;
    let lsb: number;

    do {
      msb = generateRandomByte();
      lsb = generateRandomByte();
    } while (isDuplicate(msb) || isDuplicate(lsb));

    return [msb, lsb];
  }


  closeDialog() {
    this.dialogRef.close();
  }

  generateID() {
    [this.id1, this.id2] = this.generateRandomBytes();
    this.AssetID = convertToAssetId(this.id1, this.id2);
  }
}
function convertToAssetId(msb: number, lsb: number): string {
  // Convert to hexadecimal string and create the asset ID
  const assetId: string = `${msb.toString(16).padStart(2, '0')}${lsb.toString(16).padStart(2, '0')}`;
  return 'DEADBEEF'+assetId.toUpperCase();
}

