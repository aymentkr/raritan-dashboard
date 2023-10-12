import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Peripheral, SensorElement } from "../../model/interfaces";
import { SensorService } from "../../services/sensor.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-edit-peripheral-device',
  templateUrl: './edit-peripheral-device.component.html',
  styleUrls: ['./edit-peripheral-device.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPeripheralDeviceComponent implements AfterViewInit {
  sensorForm: FormGroup;
  selectedSensorMethod: string = '';
  sensors: SensorElement[] = [];
  local_data: Peripheral;
  selectedSensor?: SensorElement;

  methodParameters: { [key: string]: string[] } = {
    setAirFlow: ['number'],
    setTemperature: ['number'],
    setAirPressure: ['number'],
    setHumidity: ['number'],
    setVibration: ['number'],
    setContactClosure: ['number', 'bool'],
    setDryContact: ['number', 'bool'],
    setDoorState: ['number', 'bool'],
    setLockState: ['number', 'bool'],
    setHandleState: ['number', 'bool'],
    setContactClosure2: ['bool'],
    setMagneticContact: ['bool'],
    setMotionDetected: ['bool'],
    setTamperAlarm: ['bool'],
    setCardId: ['number', 'str'],
    setPIN: ['number', 'str'],
  };


  constructor(
      public dialogRef: MatDialogRef<EditPeripheralDeviceComponent>,
      @Inject(MAT_DIALOG_DATA) public data: Peripheral,
      private ss: SensorService,
      private cdr: ChangeDetectorRef,
      private fb: FormBuilder,
  ) {
    this.local_data = { ...data };
    this.sensors = this.ss.getSensors();
    this.selectedSensor = this.sensors.find((sensor) => sensor.type === this.local_data.type);

    this.sensorForm = this.fb.group({
      _numberValue: [null, Validators.nullValidator],
      _boolValue: [null, Validators.nullValidator],
      _strValue: [null, Validators.nullValidator],
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  setSensorValue() {
    const parameters = this.methodParameters[this.selectedSensorMethod]
        .map((paramType) => {
          switch (paramType) {
            case 'number':
              return this.sensorForm.get('_numberValue')?.value ?? null;
            case 'bool':
              return this.sensorForm.get('_boolValue')?.value ?? null;
            case 'str':
              return this.sensorForm.get('_strValue')?.value ?? null;
            default:
              return null;
          }
        });

    // Use parameters to build the method call
    const parametersString = parameters.join(',');

    this.dialogRef.close({
      data: {
        methodName: `${this.selectedSensorMethod}(${parametersString})`,
        device: this.local_data,
      }
    });
  }


  isFormValid(): boolean {
    if (!this.selectedSensorMethod || !this.selectedSensor) {
      return false;
    }

    if (this.selectedSensorMethod.includes('Invalid')) {
      return true;
    }

    const requiredParameters = this.methodParameters[this.selectedSensorMethod];

    for (const paramType of requiredParameters) {
      const control = this.sensorForm.get(`_${paramType}Value`);
      if (!control || !control.valid) {
        return false;
      }
    }

    return true;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getParamLabel(param: string): string {
    switch (param) {
      case 'number':
        return 'Enter a number';
      case 'bool':
        return 'Select a value';
      case 'str':
        return 'Enter ID Number';
      default:
        return '';
    }
  }

  getParamFormControl(param: string): FormControl {
    switch (param) {
      case 'number':
        return this.sensorForm.get('_numberValue') as FormControl;
      case 'bool':
        return this.sensorForm.get('_boolValue') as FormControl;
      case 'str':
        return this.sensorForm.get('_strValue') as FormControl;
      default:
        return new FormControl();
    }
  }

  getParamPlaceholder(param: string): string {
    switch (param) {
      case 'number':
        return 'Placeholder for number';
      case 'bool':
        return 'Placeholder for boolean';
      case 'str':
        return 'Placeholder for string';
      default:
        return '';
    }
  }

}
