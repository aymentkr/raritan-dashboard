import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Peripheral, SensorElement} from "../../model/interfaces";
import {SensorService} from "../../services/sensor.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-edit-peripheral-device',
  templateUrl: './edit-peripheral-device.component.html',
  styleUrls: ['./edit-peripheral-device.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPeripheralDeviceComponent implements AfterViewInit{
  _numberValue = new FormControl(null);
  _boolValue = new FormControl(null);
  _strValue = new FormControl(null);

  selectedSensorMethod?: string ;
  sensors: SensorElement[] = [];
  local_data: Peripheral;
  selectedSensor?: SensorElement ;

  constructor(
    public dialogRef: MatDialogRef<EditPeripheralDeviceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Peripheral,
    private ss: SensorService,
    private cdr: ChangeDetectorRef,
  ) {
    this.local_data = {...data};
    this.sensors = this.ss.getSensors();
    this.selectedSensor = this.sensors.find(sensor => sensor.type === this.local_data.type);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  setSensorValue() {
    let parameters ='(';
    let n = this._numberValue.value;
    let str= this._strValue.value;
    let _bool = this._boolValue.value;

    if (n!= null) {
      parameters += n;
      if (_bool != null) {
        parameters += ',' + _bool;
      } else if (str != null) {
        parameters += ',' + str;
      }
    } else if (_bool != null) {
      parameters += _bool;
    }
    parameters += ')';

    this.dialogRef.close({
      data: {
        methodName: this.selectedSensorMethod+parameters,
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

    switch (this.selectedSensorMethod) {
      case 'setTemperature':
      case 'setAirPressure':
      case 'setAirFlow':
      case 'setHumidity':
      case 'setVibration':
        return this._numberValue.valid;

      case 'setContactClosure':
      case 'setDoorState':
      case 'setLockState':
      case 'setDryContact':
      case 'setHandleState':
        return this._numberValue.valid && this._boolValue.valid;

      case 'setContactClosure2':
      case 'setMotionDetected':
      case 'setTamperAlarm':
      case 'setMagneticContact':
        return this._boolValue.valid;

      case 'setCardId':
      case 'setPIN':
        return this._numberValue.valid && this._strValue.valid;

      default:
        return false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
