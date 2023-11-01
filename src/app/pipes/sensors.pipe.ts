import { Pipe, PipeTransform } from '@angular/core';
import {Peripheral, SensorElement} from "../model/interfaces";
import {WebsocketService} from "../services/websocket.service";
import Swal from "sweetalert2";
import {SensorClass} from "../model/SensorClass";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  sensors = new SensorClass().getSensors();
  constructor(private data: DataService) {}

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
    this.data.send(table+':removeAll()');
  }
  saveDevice(table:string,type: string ) {
    this.data.send(`
    new_sensor = emu.${type}:create(tfw_core)
    new_sensor:connect(${table})
    `);
  }
  callMethod(table:string, data: any) {
    this.data.send(`emu.${data.device.type}:cast(${table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.data.send(`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(table : string, peripheral: Peripheral) {
    this.data.send(`emu.${peripheral.type}:cast(${table}:findDevice("${peripheral.serial_number}")):disconnect();`);
  }

  async getLength(table: string): Promise<number> {
    return 0;
    //return await this.WSS.getResult(`print(#${table})`)
  }

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }
}
