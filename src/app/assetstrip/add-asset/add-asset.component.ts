import {Component, computed, Inject, Optional, signal} from '@angular/core';
import {Asset} from "../../model/interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssetsPipe} from "../../pipes/assets.pipe";
import {NotificationService} from "../../services/notification.service";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";
import {MAT_RADIO_DEFAULT_OPTIONS} from "@angular/material/radio";

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true},
    },
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: { color: 'warn' },
    }
  ],
})
export class AddAssetComponent {
  formGroup1= this._formBuilder.group({type: ['', Validators.required],});
  formGroup2: FormGroup;
  formGroup3: FormGroup;
  extensionSlots: number[] = Array.from({length: 16}, (_, i) => i + 1);
  extensionrackunit: number[] = this.ap.tags
    .filter(value => value.extensions && value.extensions.length > 0)
    .map(value => value.rackunit);

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
    // Update 'index' control based on the value of 'slot'
    this.formGroup1.get('type')?.valueChanges.subscribe((typeValue) => {
      const slotControl = this.formGroup2.get('slot');
      if (typeValue && typeValue === '1') {
        slotControl?.setValidators([Validators.required]);
      } else {
        slotControl?.clearValidators();
      }
      // Trigger validation update
      slotControl?.updateValueAndValidity();
    });
    this.formGroup2 = _formBuilder.group({slot: [null], index: [null],});
    // Update 'index' control based on the value of 'slot'
    this.formGroup2.get('slot')?.valueChanges.subscribe((slotValue) => {
      const indexControl = this.formGroup2.get('index');
      if (slotValue && slotValue > 0) {
        indexControl?.setValidators([Validators.required]);
      } else {
        indexControl?.clearValidators();
      }
      // Trigger validation update
      indexControl?.updateValueAndValidity();
    });
    this.formGroup3 = _formBuilder.group({
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false]
    })

    // Subscribe to changes in id1
    this.formGroup3.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });
    // Subscribe to changes in id2
    this.formGroup3.get('id2')?.valueChanges.subscribe((value:number)=> {
      this.id1.set(value ?? 0);
    });

  }


  doAction() {/*
    if (this.checkSize()) {
      if ( !this.isDuplicate(this.id1()) && !this.isDuplicate(this.id2())) {
        // Create the info object based on the presence of 'slot' or 'size'
        const asset: Asset = {
          rackunit: this.ap.IncRackunit(),
          AssetID: this.AssetID(),
          slot: this.formGroup2.get('slot')?.value,
          id1: this.id1(),
          id2: this.id2(),
          custom: this.formGroup2.get('custom')?.value
        };
        // Close the dialog with the info data
        this.dialogRef.close({data: asset});
      } else {
        this.notificationService.openToastr('Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.', 'Adding AssertID', 'error');
      }
    } else {
      this.notificationService.openToastr('You are restricted from exceeding the maximum number of Rack Units (Channels)', 'Adding AssertID', 'error');
    }*/
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
    return this.formGroup2.get('custom')?.value ? `CUSTOMID${assetId}  (programmable)`:  'DEADBEEF'+assetId;
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

