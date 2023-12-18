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
  extensionSlots: number[] = Array.from({ length: 16 }, (_, i) => i + 1);
  extensionrackunit: number[] = this.ap.tags
    .filter((value) => value.extensions && value.extensions.length > 0)
    .map((value) => value.rackunit);

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
    this.setupFormGroups();
  }

  private setupFormGroups() {
    this.formGroup1 = this._formBuilder.group({ type: [null, Validators.required] });
    this.formGroup1.get('type')?.valueChanges.subscribe((typeValue) => {
      const slotControl = this.formGroup2.get('slot');
      this.updateValidators(slotControl, typeValue === '1');
    });

    this.formGroup2 = this._formBuilder.group({ slot: [null], index: [null] });
    this.formGroup2.get('slot')?.valueChanges.subscribe((slotValue) => {
      const indexControl = this.formGroup2.get('index');
      this.updateValidators(indexControl, slotValue > 0);
    });

    this.formGroup3 = this._formBuilder.group({
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false],
    });

    this.formGroup3.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });

    this.formGroup3.get('id2')?.valueChanges.subscribe((value: number) => {
      this.id2.set(value ?? 0);
    });
  }

  private updateValidators(control: any, condition: boolean) {
    if (condition) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }

  submit() {
    if (this.checkSize()) {
      if (!this.isDuplicate(this.id1()) && !this.isDuplicate(this.id2())) {
        const isExt = this.formGroup1.get('type')?.value === 2;
        const slot = this.formGroup2.get('slot')?.value;
        const rackunit = slot === 0 ? this.ap.IncRackunit() : this.formGroup2.get('index')?.value;

        const asset: Asset = {
          rackunit: rackunit,
          AssetID: this.AssetID(),
          slot: slot,
          id1: this.id1(),
          id2: this.id2(),
          custom: this.formGroup3.get('custom')?.value,
        };

        if (isExt) {
          asset.extensions = Array(16).fill(null);
        }

        this.dialogRef.close({
          data: {
            isExt: isExt,
            asset: asset,
          },
        });
      } else {
        this.notificationService.openToastr(
          'Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.',
          'Adding AssertID',
          'error'
        );
      }
    } else {
      this.notificationService.openToastr(
        'You are restricted from exceeding the maximum number of Rack Units (Channels)',
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
    } while (this.isDuplicate(x));

    return x;
  }

  convertToAssetId(msb: number, lsb: number): string {
    const assetId: string = `${msb.toString(16).padStart(2, '0')}${lsb.toString(16).padStart(2, '0')}`.toUpperCase();
    return this.formGroup3.get('custom')?.value ? `CUSTOMID${assetId}  (programmable)` : 'DEADBEEF' + assetId;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  generateID() {
    this.id1.set(this.generateRandomBytes());
    this.id2.set(this.generateRandomBytes());
  }

  isDuplicate(value: number): boolean {
    return this.ap.tags.some((tag) => tag.id1 === value || tag.id2 === value);
  }

  private checkSize(): boolean {
    return this.ap.tags.length <= 64;
  }
}
