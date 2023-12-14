import {Component, computed, Inject, Optional, signal} from '@angular/core';
import {Asset} from "../../model/interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssetsPipe} from "../../pipes/assets.pipe";
import {NotificationService} from "../../services/notification.service";

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
  id1 = signal(this.generateRandomBytes());
  id2 = signal(this.generateRandomBytes());
  AssetID = computed(() => this.convertToAssetId(this.id1(),this.id2()));

  constructor(
    private notificationService: NotificationService,
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
      this.title = 'Connects a Virtual Blade Extension to this Asset Strip';
      this.desc1 = 'size - number of blade extension slots to emulate';
      this.desc2 = `id1 and id2 - blade extension is itself a "tag" and has its own ID`;
      this.desc3 = `If custom=true, blade extension's ID will be user-programmable`;
    }

    this.form = this.fb.group({
      slot: [null, this.isExt ? [] : Validators.required],
      size: [null, this.isExt ? [Validators.required, Validators.min(1)] : []],
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false]
    });

    // Subscribe to changes
    this.form.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });

    this.form.get('id2')?.valueChanges.subscribe((value:number)=> {
      this.id1.set(value ?? 0);
    });

  }

  doAction() {
    if ( !this.isDuplicate(this.id1()) && !this.isDuplicate(this.id2())) {
      // Create the info object based on the presence of 'slot' or 'size'
      const asset: Asset = this.isExt
        ? {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID(),
          size: this.form.get('size')?.value,
          id1: this.id1(),
          id2: this.id2(),
          custom: this.form.get('custom')?.value
        }
        : {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID(),
          slot: this.form.get('slot')?.value,
          id1: this.id1(),
          id2: this.id2(),
          custom: this.form.get('custom')?.value
        };
      // Close the dialog with the info data
      this.dialogRef.close({data: asset});
    } else {
      this.notificationService.openToastr('Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.', 'Adding AssertID', 'error');
    }
  }

  generateRandomBytes(): number{
    const generateRandomByte = (): number => Math.floor(Math.random() * 256);
    let x:number;

    do {
      x = generateRandomByte();
    } while (this.isDuplicate(x));

    return x;
  }

  convertToAssetId(msb: number, lsb: number): string {
    // Convert to hexadecimal string and create the asset ID
    const assetId: string = `${msb.toString(16).padStart(2, '0')}${lsb.toString(16).padStart(2, '0')}`.toUpperCase();
    return this.form.get('custom')?.value ? `CUSTOM${assetId}  (programmable)`:  'DEADBEEF'+assetId;
  }


  closeDialog() {
    this.dialogRef.close();
  }

  generateID() {
    this.id1.set(this.generateRandomBytes());
    this.id2.set( this.generateRandomBytes());
  }

  isDuplicate (value: number): boolean {
    return this.ap.tags.some(tag => tag.id1 === value || tag.id2 === value) ||
      this.ap.extensions.some(ext => ext.id1 === value || ext.id2 === value);
  }
}

