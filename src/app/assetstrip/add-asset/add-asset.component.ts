import {Component, computed, Inject, Optional, signal} from '@angular/core';
import {Asset} from "../../model/interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssetsPipe} from "../../pipes/assets.pipe";
import {NotificationService} from "../../services/notification.service";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
  ],
})
export class AddAssetComponent {
  isExt: boolean;
  title = '';
  desc1 = '';
  desc2 = '';
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup: FormGroup;
  extensionSlots: number[] = Array.from({length: 16}, (_, i) => i + 1);
  id1 = signal(this.generateRandomBytes());
  id2 = signal(this.generateRandomBytes());
  AssetID = computed(() => this.convertToAssetId(this.id1(),this.id2()));

  constructor(
    private notificationService: NotificationService,
    private ap: AssetsPipe,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {
    this.isExt = data;
    if (!this.isExt) {
      this.title = 'Connects a Virtual Asset Tag to this Asset Strip';
      this.desc1 = 'Tag ID will consist of bytes id1 (MSB) and id2 (LSB)';
      this.desc2 = 'If custom=true, tag will be programmable';
    } else {
      this.title = 'Connects a Virtual Blade Extension to this Asset Strip';
      this.desc1 = `id1 and id2 - blade extension is itself a "tag" and has its own ID`;
      this.desc2 = `If custom=true, blade extension's ID will be user-programmable`;
    }

    this.secondFormGroup = this._formBuilder.group({
      slot: [null, this.isExt ? [] : Validators.required],
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false]
    });

    // Subscribe to changes in id1
    this.secondFormGroup.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });
    // Subscribe to changes in id2
    this.secondFormGroup.get('id2')?.valueChanges.subscribe((value:number)=> {
      this.id1.set(value ?? 0);
    });
  }

  doAction() {
    if (this.checkSize()) {
      if ( !this.isDuplicate(this.id1()) && !this.isDuplicate(this.id2())) {
        // Create the info object based on the presence of 'slot' or 'size'
        const asset: Asset = {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID(),
          slot: this.secondFormGroup.get('slot')?.value,
          id1: this.id1(),
          id2: this.id2(),
          custom: this.secondFormGroup.get('custom')?.value
        };
        // Close the dialog with the info data
        this.dialogRef.close({data: asset});
      } else {
        this.notificationService.openToastr('Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.', 'Adding AssertID', 'error');
      }
    } else {
      this.notificationService.openToastr('You are restricted from exceeding the maximum number of Rack Units (Channels)', 'Adding AssertID', 'error');
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
    return this.secondFormGroup.get('custom')?.value ? `CUSTOM${assetId}  (programmable)`:  'DEADBEEF'+assetId;
  }


  closeDialog() {
    this.dialogRef.close();
  }

  generateID() {
    this.id1.set(this.generateRandomBytes());
    this.id2.set( this.generateRandomBytes());
  }

  isDuplicate (value: number): boolean {
    return this.ap.tags.some(tag => tag.id1 === value || tag.id2 === value) ;
  }

  private checkSize(): boolean {
    return  this.ap.tags.length <= 64;
  }

}

