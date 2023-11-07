import { Pipe, PipeTransform } from '@angular/core';
import {Envhub, Peripheral, SensorElement} from "../model/interfaces";
import Swal from "sweetalert2";
import {SensorClass} from "../model/SensorClass";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  sensors = new SensorClass().getSensors();
  constructor(private data: DataService) {}

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }

  infoDevice = (obj: Peripheral): void => {
    let selectedSensor = this.sensors.find(sensor => sensor.type === obj.type);
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
    this.data.sendToGo(table+':removeAll()');
  }
  saveDevice(table:string,type: string ) {
    this.data.sendToGo(`
    new_sensor = emu.${type}:create(tfw_core)
    new_sensor:connect(${table})
    `);
  }
  callMethod(table:string, data: any) {
    this.data.sendToGo(`emu.${data.device.type}:cast(${table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.data.sendToGo(`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(table : string, peripheral: Peripheral) {
    this.data.sendToGo(`emu.${peripheral.type}:cast(${table}:findDevice("${peripheral.serial_number}")):disconnect();`);
  }

  async getLength(table: string): Promise<number> {
    return parseFloat(await this.data.getResult(`#${table}`,`print(#${table})`))
  }

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  convertLinesToPeripherals(lines: string[]):Peripheral[]{
    const peripherals: Peripheral[] = [];
    let index=1;
    for (const line of lines) {
      const match = line.match(/([A-Z0-9_]+): ([A-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const serialNumber = match[2];
        this.sensors.filter(item => {
          if (item.type === type) {
            peripherals.push({
              id: index,
              name: item.name,
              type: item.type,
              serial_number: serialNumber,
            });
            index++;
          }
        });
      }
    }
    return peripherals;
  }
  async fetchEnvhubsData() {
    const peripherals:Envhub = {};
    const size = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));
    if (size === 1) {
      for (let i = 0; i < 4; i++) {
        const lines = (await this.data.getResult(`envhubs[1]:getPort(${i}):listDevices`, `print(envhubs[1]:getPort(${i}):listDevices())`)).split('\n');
        peripherals[i] = this.convertLinesToPeripherals(lines);
      }
    }
    return {
      ...peripherals
    }
  }
  async fetchPeripheralData() {
    const size = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    if (size === 1) {
      const lines = (await this.data.getResult('sensorports[1]:listDevices', 'print(sensorports[1]:listDevices())')).split('\n');
      return this.convertLinesToPeripherals(lines);
    } else return []
  }

  async fetchSmartLockData() {
    const type = 'DX2_DH2C2';
    let peripherals = await this.fetchPeripheralData();
    let envhubs = await this.fetchEnvhubsData();
    if (peripherals.length === 0 && Object.keys(envhubs).length === 0){
      return [];
    } else {
      peripherals = peripherals.filter((peripheral) => peripheral.type === type);
      const filteredEnvhubData = envhubs[0]
        .concat(envhubs[1], envhubs[2], envhubs[3])
        .filter((peripheral) => peripheral.type === type);
      return peripherals.concat(filteredEnvhubData);
    }
  }
}
