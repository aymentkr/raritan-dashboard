import { Injectable } from '@angular/core';
import {Peripheral, SensorElement} from '../model/interfaces';
import { WebsocketService } from './websocket.service';
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  sensors: SensorElement[] = [
    {
      name: 'Air Flow 1',
      type: 'DPX_AF1',
      generation: 1,
      prefix: 'PRB',
      methods: ['setAirFlow']
    },
    {
      name: 'Air Flow 2',
      type: 'DX2_AF1',
      generation: 3,
      prefix: '236',
      methods: ['setAirFlow', 'setAirFlowInvalid']
    },
    {
      name: 'Temperature 1',
      type: 'DPX_T1',
      generation: 1,
      prefix: 'AEH',
      methods: ['setTemperature']
    },
    {
      name: 'Temperature 2',
      type: 'DPX2_T1',
      generation: 2,
      prefix: 'QMT',
      methods: ['setTemperature']
    },
    {
      name: 'Temperature 3',
      type: 'DX2_T1',
      generation: 3,
      prefix: '1JX',
      methods: ['setTemperature', 'setTemperatureInvalid']
    },
    {
      name: 'Temperature/Differential Air Pressure 1',
      type: 'DPX_T1DP1',
      generation: 1,
      prefix: 'PJ8',
      methods: ['setTemperature', 'setAirPressure']
    },
    {
      name: 'Temperature/Differential Air Pressure 2',
      type: 'DPX2_T1DP1',
      generation: 3,
      prefix: '23A',
      methods: ['setTemperature', 'setAirPressure', 'setTemperatureInvalid', 'setAirPressureInvalid']
    },
    {
      name: 'Temperature/Humidity 1',
      type: 'DPX_T1H1',
      generation: 1,
      prefix: 'AEI',
      methods: ['setTemperature', 'setHumidity']
    },
    {
      name: 'Temperature/Humidity 2',
      type: 'DPX2_T1H1',
      generation: 2,
      prefix: 'AEI',
      methods: ['setTemperature', 'setHumidity']
    },
    {
      name: 'Temperature/Humidity 3',
      type: 'DX2_T1H1',
      generation: 3,
      prefix: '1EQ',
      methods: ['setTemperature', 'setHumidity', 'setTemperatureInvalid', 'setHumidityInvalid']
    },
    {
      name: 'Dry Contact/Contact Closure 1',
      type: 'DX_D2C6',
      generation: 2,
      prefix: 'QLL',
      methods: ['setContactClosure', 'setDryContact', 'setMagneticContact']
    },
    {
      name: 'Dry Contact/Contact Closure 2',
      type: 'DX2_D2C6',
      generation: 3,
      prefix: '2DG',
      methods: ['setContactClosure', 'setDryContact', 'setMagneticContact']
    },
    {
      name: 'Powered Dry Contact/Contact Closure 1',
      type: 'DX_PD2C5',
      generation: 2,
      prefix: 'QU7',
      methods: ['setContactClosure', 'setDryContact']
    },
    {
      name: 'Powered Dry Contact/Contact Closure 2',
      type: 'DX2_PD2C5',
      generation: 3,
      prefix: '2DH',
      methods: ['setContactClosure', 'setDryContact']
    },
    {
      name: 'Motion Detector 1',
      type: 'DX_PIR',
      generation: 2,
      prefix: 'QMQ',
      methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm']
    },
    {
      name: 'Motion Detector 2',
      type: 'DX2_PIR',
      generation: 3,
      prefix: '2DF',
      methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm']
    },
    {
      name: 'Doorhandle Controller',
      type: 'DX2_DH2C2',
      generation: 3,
      prefix: '1GE',
      methods: ['setDoorState', 'setHandleState', 'setCardId', 'setPIN']
    },
    {
      name: 'Vibration Sensor',
      type: 'DX2_VBR',
      generation: 3,
      prefix: '2DE',
      methods: ['setVibration', 'setContactClosure2', 'setVibrationInvalid']
    },
  ];

  constructor(private WSS: WebsocketService) {}

  getSensors() {
    return this.sensors;
  }

   infoDevice = (obj: Peripheral): void => {
    let selectedSensor = this.getSensors().find(sensor => sensor.type === obj.type);
    if (selectedSensor) {
      const formattedMethods = selectedSensor.methods.join('\n');

      Swal.fire({
        title: 'Peripheral Device ID: ' + obj.id,
        html: '<mark>' + 'Methods:' + '</mark>' + '<pre>' + formattedMethods + '</pre>',
        icon: 'info'
      });
    } else {
      Swal.fire('Peripheral Device ID: ' + obj.id, 'Sensor not found', 'error');
    }
  };

  removeAll(table:string) {
    this.WSS.sendMessage(table+':removeAll()');
  }
  async saveDevice(table:string,type: string ) {
    await this.WSS.sendMessage(`
    new_sensor = emu.${type}:create(tfw_core)
    new_sensor:connect(${table})
    `);
  }
  callMethod(table:string, data: any) {
    this.WSS.sendMessage(`emu.${data.device.type}:cast(${table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.WSS.sendMessage(`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(table : string, peripheral: Peripheral) {
    this.WSS.sendMessage(`emu.${peripheral.type}:cast(${table}:findDevice("${peripheral.serial_number}")):disconnect();`);
  }

  async getLength(table: string): Promise<number> {
    return await this.WSS.getResult(`print(#${table})`)
  }
}
