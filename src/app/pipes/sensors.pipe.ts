import {Pipe, PipeTransform} from '@angular/core';
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
  deviceMap = new Map<string, Device>;
  device_id = 0;
  sensors = new SensorClass().getSensors();

  constructor(
    private data: DataService,
    private Peripheral: PeripheralClass,
    private notificationService: NotificationService,
  ) {
  }

  transform(value: any, ...args: any[]): any {
    return this.sensors;
  }

  infoDevice = (obj: Device): void => {/*
    let selectedSensor = this.sensors.find(sensor => sensor.type === obj.type);
    if (selectedSensor) {
      const formattedMethods = selectedSensor.methods.join('\n');
      this.notificationService.openToastr(formattedMethods, `Device ID: ${obj.device_id} (Methods)`, 'info');
    } else {
      this.notificationService.openToastr('Peripheral Device ID: ' + obj.device_id, 'Sensor not found', 'error');
    }*/
  };

  saveDevice(table: string, type: string) {
    this.data.sendToGo(`emu.${type}:create(tfw_core):connect(${table})`);
  }

  connectDevice(parent:Device,table: string, type: string){/*
    this.data.sendToGo(`
    emu.${type}:create(tfw_core):connect(emu.${parent.type}:cast(${table}:findDevice("${parent.serial_number}")))
    `);*/
  }

  callMethod(table: string, data: any) {
    this.data.sendToGo(`emu.${data.device.type}:cast(${table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.data.sendToGo(`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(table: string, device: Device) {
    /*
    this.deviceMap.delete(device.serial_number);
    this.data.sendToGo(`emu.${device.type}:cast(${table}:findDevice("${device.serial_number}")):disconnect();`);*/
  }
  removeDeviceFromParent(table: string, device: Device) {/*
    this.deviceMap.delete(device.serial_number);
    this.data.sendToGo(`emu.${device.type}:cast(${table}:findDevice("${device.serial_number}")):disconnect();`);*/
  }

  removeAll(table: string) {
    this.deviceMap.clear();
    this.data.sendToGo(table + ':removeAll()');
  }

  async getLength(table: string): Promise<number> {
    return parseFloat(await this.data.getResult(`#${table}`, `print(#${table})`))
  }

  filterSensorsByType(type: string): SensorElement | undefined {
    return this.sensors.find(sensor => sensor.type === type);
  }

  getPeripheralByType(index: number, type: string) {
    const selectedSensor = this.sensors.find(sensor => sensor.type === type);
    if (selectedSensor) {
      return this.Peripheral.getDevices(index, selectedSensor)
    } else
      return [];
  }

  getDeviceMap() {
    return this.deviceMap;
  }

  parseJsonToDevices(jsonString: string): Device[] {
    return  JSON.parse(jsonString);
  }
/*
  private convertDataToDevices(deviceData: any): Device {
    console.log(deviceData.type)
    const matchingSensor = this.sensors.find((item) => item.type === deviceData.type);

    if (matchingSensor) {
      const device: Device = {
        isParent: deviceData.tailports !== undefined,
        device_id: ++this.device_id,
        name: matchingSensor.name,
        type: deviceData.type,
        serial_number: deviceData.serial,
        peripherals: new MatTableDataSource<Peripheral>(deviceData.peripherals)
      };

      // If tailports exist, recursively parse them
      if (device.isParent) {
        if (Array.isArray(deviceData.tailports)) {
          device.tailports = deviceData.tailports.map((tailport: any) =>
            this.convertDataToDevices(tailport)
          );
        } else {
          device.tailports = [this.convertDataToDevices(deviceData.tailports)];
        }
      }

      return device;
    } else {
      console.error(`Sensor type '${deviceData.type}' not found.`);
      return {
        isParent: deviceData.tailports !== undefined,
        device_id: ++this.device_id,
        name: 'Sensor Not Found',
        type: deviceData.type,
        serial_number: deviceData.serial,
        peripherals: new MatTableDataSource<Peripheral>(this.getPeripheralByType(this.device_id, deviceData.type)),
      };
    }
  }



*/

}
