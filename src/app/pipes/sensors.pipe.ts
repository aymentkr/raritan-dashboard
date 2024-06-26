import {Pipe, PipeTransform} from '@angular/core';
import { DeviceFlatNode, DeviceNode, Peripheral, SensorElement} from "../model/interfaces";
import {SensorClass} from "../model/SensorClass";
import {DataService} from "../services/data.service";
import {MatTableDataSource} from "@angular/material/table";
import {PeripheralClass} from "../model/PeripheralClass";
import {NotificationService} from "../services/notification.service";

@Pipe({
  name: 'sensors'
})
export class SensorsPipe implements PipeTransform {
  deviceMap = new Map<string, DeviceFlatNode>;
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

  infoDevice = (obj: DeviceFlatNode): void => {
    let selectedSensor = this.sensors.find(sensor => sensor.type === obj.type);
    if (selectedSensor) {
      const formattedMethods = selectedSensor.methods.join('\n');
      this.notificationService.openToastr(formattedMethods, `Device ID: ${obj.device_id} (Methods)`, 'info');
    } else {
      this.notificationService.openToastr('Peripheral Device ID: ' + obj.device_id, 'Sensor not found', 'error');
    }
  };

  saveDevice(table: string, data: any) {
    if (data.lastChild && !data.type.includes('DPX_')) {
      const lastConnectedDevice = this.deviceMap.get(data.lastChild.serial);
      if (lastConnectedDevice) {
        this.device_id = lastConnectedDevice.device_id;
        this.device_id -- ;
        // Create an array of keys
        const keysToDelete = Array.from(this.deviceMap.keys()).reverse();

        // Delete items from the end of the map until reaching the specified key
        for (const key of keysToDelete) {
          this.deviceMap.delete(key);
          if (key === lastConnectedDevice.serial_number) {
            break;
          }
        }
      }
      this.data.sendToGo(`
      emu.${data.type}:create(tfw_core):connect(emu.${data.lastChild.type}:cast(${table}:findDevice("${data.lastChild.serial}")))
    `);
    }
    else
      this.data.sendToGo(`emu.${data.type}:create(tfw_core):connect(${table})`);
  }

  callMethod( data: any) {
    this.data.sendToGo(`emu.${data.device.type}:cast(${data.device.table}:findDevice("${data.device.serial_number}")):${data.methodName}`);
  }

  setFuseState(i: number, state: boolean) {
    this.data.sendToGo(`envhubs[1]:setFuseState(${i}, ${state})`);
  }

  removeDevice(device: DeviceFlatNode) {
    this.deviceMap.delete(device.serial_number);
    this.data.sendToGo(`emu.${device.type}:cast(${device.table}:findDevice("${device.serial_number}")):disconnect();`);
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

  _transformer = (node: DeviceNode, level: number, table:string): DeviceFlatNode => {
    let myDevice = this.deviceMap.get(node.serial);
    if (myDevice) return myDevice;
    else {
      const sensor = this.sensors.find(item => item.type === node.type) ;
      myDevice = {
        expandable: !!node.tailports && node.tailports.length > 0,
        device_id: ++this.device_id,
        name: sensor?.name || 'Invalid Device',
        type: node.type,
        serial_number: node.serial,
        table: table,
        peripherals: new MatTableDataSource<Peripheral>(this.getPeripheralByType(this.device_id, node.type)),
        level: level,
      };
      this.deviceMap.set(node.serial, myDevice);
      return myDevice;
    }
  }

  convertToDevices(data: any): DeviceNode[] {
    if (Array.isArray(data)) {
      return data.flatMap(item => this.convertToDevices(item));
    } else {
      const { type, serial, tailports } = data;
      return [{
        type,
        serial,
        tailports: tailports ? this.convertToDevices(tailports) : undefined
      }];
    }
  }
}
