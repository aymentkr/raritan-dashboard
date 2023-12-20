import {Component, computed, Inject, Optional, signal} from '@angular/core';
import { Asset } from '../../model/interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsPipe } from '../../pipes/assets.pipe';
import { NotificationService } from '../../services/notification.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: { color: 'warn' },
    },
  ],
})
export class AddAssetComponent {
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;
  TAGINDEX: number[] = Array.from({ length: 64 }, (_, i) => i + 1);

  id1 = signal(this.generateRandomBytes());
  id2 = signal(this.generateRandomBytes());
  AssetID = computed(() => this.ap.convertToAssetId(this.formGroup3.get('custom')?.value,this.id1(),this.id2()));
  constructor(
    private notificationService: NotificationService,
    private ap: AssetsPipe,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Asset[]
  ) {
    this.setupFormGroups();
  }
  private setupFormGroups() {
    this.formGroup1 = this._formBuilder.group({ type: [null, Validators.required] });
    this.formGroup2 = this._formBuilder.group({
      slot: [null, Validators.required],
      index: [null, Validators.required],
    });
    this.formGroup3 = this._formBuilder.group({
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false],
    });

    this.formGroup1.get('index')?.valueChanges.subscribe((index) => {
      const slotControl = this.formGroup2.get('slot');
      if (!slotControl?.valid)
        slotControl?.setValidators([Validators.required]);
      else
        slotControl?.clearValidators();
      slotControl?.updateValueAndValidity();
    });


    this.formGroup3.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });

    this.formGroup3.get('id2')?.valueChanges.subscribe((value: number) => {
      this.id2.set(value ?? 0);
    });
  }

  submit() {
    if (!isDuplicate(this.data,this.id1()) && !isDuplicate(this.data,this.id2())) {
      this.dialogRef.close({
        data: {
          index: this.formGroup2.get('index')?.value,
          slot : this.formGroup2.get('slot')?.value,
          size : this.formGroup2.get('size')?.value,
          custom: this.formGroup3.get('custom')?.value,
          id1: this.id1(),
          id2: this.id2(),
        }
      });
    } else {
      this.notificationService.openToastr(
        'Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.',
        'Adding AssertID',
        'error'
      );
    }
  }

  generateRandomBytes(): number {
    const generateRandomByte = (): number => Math.floor(Math.random() * 256);
    let x: number;

    do {
      x = generateRandomByte();
    } while (isDuplicate(this.data,x));

    return x;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  generateID() {
    this.id1.set(this.generateRandomBytes());
    this.id2.set(this.generateRandomBytes());
  }


  extensionSlots(index: number) {
    const ext = this.data.find((value) => value.Type.includes('ext') && value.Index === index);
    // Early return if ext is not found
    if (!ext) {
      return [];
    }
    console.log(ext);
    // Use optional chaining for accessing properties
    const length = ext?.Type ? parseInt(ext.Type.slice(3)) : 0;
    // Generate array using Array.from
    return Array.from({ length }, (_, i) => i + 1);
  }

}
function isDuplicate(data: Asset[], value: number): boolean {
  const checkDuplicates = (asset: Asset): boolean => {
    return <boolean>(asset.ID1 === value || asset.ID2 === value || (asset.Extensions && isDuplicate(asset.Extensions, value)));
  };

  return data.some(checkDuplicates);
}
