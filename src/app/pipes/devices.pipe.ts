import { Pipe, PipeTransform } from '@angular/core';
import {DeviceFlatNode, VPD} from "../model/interfaces";
import {SensorsPipe} from "./sensors.pipe";
import {MatTableDataSource} from "@angular/material/table";
@Pipe({
  name: 'devices',
})
export class DevicesPipe implements PipeTransform {

  myMap = new Map<string, DeviceFlatNode>();
  constructor(sp: SensorsPipe) {
    this.myMap = sp.getDeviceMap();
  }

  transform(value: unknown, ...args: unknown[]): MatTableDataSource<VPD> {
    const VPDs: VPD[] = [];
    this.myMap.forEach((device) => {
      device.peripherals.data.forEach((peripheral) => {
        VPDs.push({
          peripheral_id: peripheral.peripheral_id,
          name: peripheral.name,
          type: peripheral.type,
          sensor_name: device.name,
          sensor_type: device.type,
          serial_number: device.serial_number,
        });
      });
    });
    return new MatTableDataSource<VPD>(VPDs);
  }
}
