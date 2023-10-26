import { Pipe, PipeTransform } from '@angular/core';
import {Peripheral, SensorElement} from "../model/interfaces";
import {WebsocketService} from "../services/websocket.service";
import Swal from "sweetalert2";
import {SensorClass} from "../model/SensorClass";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  sensors = new SensorClass().getSensors();
  constructor(private WSS: WebsocketService) {}

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

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }
}
