import {Component, computed, Inject, Optional, signal} from '@angular/core';
import { Asset } from '../../model/interfaces';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsPipe } from '../../pipes/assets.pipe';
import { NotificationService } from '../../services/notification.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import {DeleteDeviceDialogComponent} from "../../peripheral/delete-device-dialog/delete-device-dialog.component";

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
    private dialog: MatDialog,
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
      index: [null, Validators.required],
      slot: [null, [Validators.required, Validators.min(0)]],
    });
    this.formGroup3 = this._formBuilder.group({
      id1: [null, [Validators.min(0)]],
      id2: [null, [Validators.min(0)]],
      custom: [false],
    });

    this.formGroup2.get('index')?.valueChanges.subscribe(() => {
      if (this.formGroup1.get('type')?.value === 'tag')
        this.formGroup2.get('slot')?.setValue(null);
    });


    this.formGroup3.get('id1')?.valueChanges.subscribe((value: number) => {
      this.id1.set(value ?? 0);
    });

    this.formGroup3.get('id2')?.valueChanges.subscribe((value: number) => {
      this.id2.set(value ?? 0);
    });
  }

  async submit() {
    const id1 = this.id1();
    const id2 = this.id2();
    const index = this.formGroup2.get('index')?.value;
    const type = this.formGroup1.get('type')?.value;
    const slot = this.formGroup2.get('slot')?.value;

    if (id1 === id2 || this.ap.isDuplicate(this.data, id1) || this.ap.isDuplicate(this.data, id2)) {
      this.notificationService.openToastr(
        'Make sure that the IDs are unique. 2 tags with the same ID can be discovered at the same time.',
        'Adding AssertID',
        'error'
      );
      return;
    }

    // Check if an asset already exists at this location
    const asset =this.data[index - 1]
    if (asset.state) {
      // check if the tag not exists in extension (if yes there is no need for replacement alert
      if (!(type === 'tag' && slot > 0 && asset.Extensions && asset?.Extensions?.length>0 && !asset.Extensions[slot - 1].state)){
        // Open the dialog only if needed
        const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
          width: '600px',
          maxHeight: '400px',
          data: `Asset already exists at Index ${index}, you want to replace it?`,
        });

        if (!(await dialogRef.afterClosed().toPromise())) {
          // User canceled, do not proceed
          return;
        }
      }
    }

    // Proceed with submission
    this.dialogRef.close({
      data: {
        isTag: type === 'tag',
        index: index,
        slot: slot,
        custom: this.formGroup3.get('custom')?.value,
        id1: id1,
        id2: id2,
      }
    });

    this.notificationService.openToastr(
      `New Asset with Type: ${type} and ID ${this.AssetID()} saved successfully`,
      `Adding Asset at Index ${index}`,
      'done'
    );
  }



  generateRandomBytes(): number {
    const generateRandomByte = (): number => Math.floor(Math.random() * 256);
    let x: number;

    do {
      x = generateRandomByte();
    } while (this.ap.isDuplicate(this.data,x));

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
    const ext = this.data.find((value) => value.type.includes('ext') && value.Index === index);
    // Early return if ext is not found
    if (!ext) return [];
    // Use optional chaining for accessing properties
    const length = ext?.type ? parseInt(ext.type.slice(3)) : 0;
    // Generate array using Array.from
    return Array.from({ length }, (_, i) => i + 1);
  }

}
