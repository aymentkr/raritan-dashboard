import { Pipe, PipeTransform } from '@angular/core';
import {SensorPort, Peripheral, SensorElement} from "../model/interfaces";
import Swal from "sweetalert2";
import {SensorClass} from "../model/SensorClass";
import {DataService} from "../services/data.service";
import {MatTableDataSource} from "@angular/material/table";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  sensors = new SensorClass().getSensors();
  size_devices = 0;
  constructor(private data: DataService) {}

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }

  infoDevice = (obj: SensorPort): void => {
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

  removeDevice(table : string, peripheral: SensorPort) {
    this.data.sendToGo(`emu.${peripheral.type}:cast(${table}:findDevice("${peripheral.serial_number}")):disconnect();`);
  }

  async getLength(table: string): Promise<number> {
    return parseFloat(await this.data.getResult(`#${table}`,`print(#${table})`))
  }

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  getPeripheralByType(type : string) {
    const peripherals:Peripheral[] = [];
    const selectedSensor = this.sensors.find(sensor => sensor.type === type);
    selectedSensor?.devices.forEach((device) => {
      for (let i  = 1 ; i<=device.size; i++) {
        this.size_devices++;
        peripherals.push({
          device_id: this.size_devices ,
          name: `${device.name}  ${i}`,
          type: device.type
        });
      }
    });
    return peripherals;
  }


  convertLinesToSensors(lines: string[]): SensorPort[] {
    const sensors: SensorPort[] = [];
    this.size_devices = 0;
    let index = 1;
    for (const line of lines) {
      const match = line.match(/([A-Z0-9_]+): ([A-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const serialNumber = match[2];
        this.sensors.filter((item) => {
          if (item.type === type) {
            const PeripheralDataSource = new MatTableDataSource<Peripheral>(this.getPeripheralByType(type));
            sensors.push({
              id: index,
              name: item.name,
              type: item.type,
              serial_number: serialNumber,
              peripherals: PeripheralDataSource,
            });
            index++;
          }
        });
      }
    }
    return sensors;
  }


}
