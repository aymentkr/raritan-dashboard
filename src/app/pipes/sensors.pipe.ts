import { Pipe, PipeTransform } from '@angular/core';
import {Device, Peripheral, SensorElement} from "../model/interfaces";
import {SensorClass} from "../model/SensorClass";
import {DataService} from "../services/data.service";
import {MatTableDataSource} from "@angular/material/table";
import {PeripheralClass} from "../model/PeripheralClass";
import {NotificationService} from "../services/notification.service";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  deviceMap = new Map<string,Device>;
  device_id = 1;
  sensors = new SensorClass().getSensors();
  constructor(
    private data: DataService,
    private Peripheral: PeripheralClass,
    private notificationService: NotificationService,
  ) {}

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }

  infoDevice = (obj: Device): void => {
    let selectedSensor = this.sensors.find(sensor => sensor.type === obj.type);
    if (selectedSensor) {
      const formattedMethods = selectedSensor.methods.join('\n');
      this.notificationService.openToastr(formattedMethods, `Device ID: ${obj.device_id} (Methods)`, 'info');
    } else {
      this.notificationService.openToastr('Peripheral Device ID: ' + obj.device_id, 'Sensor not found', 'error');
    }
  };

  saveDevice(table:string,type: string ) {
    this.data.send('',`
    new_sensor = emu.${type}:create(tfw_core)
    new_sensor:connect(${table})
    `);
  }
  callMethod(table:string, data: any) {
    this.data.send('',`emu.${data.device.type}:cast(${table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.data.send('',`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(table : string, device: Device) {
    this.deviceMap.delete(device.serial_number);
    console.log(`emu.${device.type}:cast(${table}:findDevice("${device.serial_number}")):disconnect();`)
    this.data.send('',`emu.${device.type}:cast(${table}:findDevice("${device.serial_number}")):disconnect();`);
  }

  removeAll(table:string) {
    this.deviceMap.clear();
    this.data.send('',table+':removeAll()');
  }

  async getLength(table: string): Promise<number> {
    return parseFloat(await this.data.getResult(`#${table}`,`print(#${table})`))
  }

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  getPeripheralByType(index:number,type : string) {
    const selectedSensor = this.sensors.find(sensor => sensor.type === type);
    if (selectedSensor){
      return this.Peripheral.getDevices(index,selectedSensor)
    } else
      return [];
  }

  convertLinesToDevices(lines: string[]): Device[] {
    const devices: Device[] = [];
    for (const line of lines) {
      const match = line.match(/([A-Z0-9_]+): ([A-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const serialNumber = match[2];
        const myDevice = this.deviceMap.get(serialNumber);
        if (myDevice) {
          devices.push(myDevice);
        } else {
          this.sensors.filter((item) => {
            if (item.type === type) {
              const PeripheralDataSource = new MatTableDataSource<Peripheral>(this.getPeripheralByType(this.device_id,type));
              const dev : Device = {
                device_id: this.device_id,
                name: item.name,
                type: item.type,
                serial_number: serialNumber,
                peripherals: PeripheralDataSource,
              }
              devices.push(dev);
              this.deviceMap.set(serialNumber,dev);
              this.device_id++;
            }
          });
        }
      }
    }
    return devices;
  }

  getDeviceMap(){
    return this.deviceMap;
  }


}
