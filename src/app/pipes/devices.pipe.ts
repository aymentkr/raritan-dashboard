import { Pipe, PipeTransform } from '@angular/core';
import {Device} from "../model/interfaces";
import {SensorsPipe} from "./sensors.pipe";
import {MatTableDataSource} from "@angular/material/table";

interface VPD {
  peripheral_id :number,
  device_name : string,
  device_type : string,
  sensor_type : string,
  serial_number : string
}

@Pipe({
  name: 'devices'
})
export class DevicesPipe implements PipeTransform {

  myMap= new Map<string,Device>;
  constructor(sp:SensorsPipe) {
    this.myMap = sp.getDeviceMap();
  }

  transform(value: unknown, ...args: unknown[]): MatTableDataSource<VPD> {
    const VPDs :VPD[] = []
    this.myMap.forEach((device, serial_number) => {
      device.peripherals.data.forEach((peripheral) => {
        VPDs.push({
          peripheral_id : peripheral.peripheral_id,
          device_name: device.name,
          device_type: peripheral.type,
          sensor_type : device.type,
          serial_number:serial_number,
        })
      })
    })
    console.log(this.myMap)
    return new MatTableDataSource<VPD>(VPDs)
  }

}
