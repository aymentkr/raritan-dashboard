import {Peripheral, SensorElement} from "./interfaces";

interface Size {
  total: number;
  [deviceName: string]: number;
}

export class PeripheralClass {
  private devices = new Map<number, Peripheral[]>();
  private size: Size = {
    total: 0,
  };
  constructor() {
  }

  getDevices(index:number,selectedSensor: SensorElement) {
    if (!this.devices.get(index)){
      const peripherals:Peripheral[] = [];
      selectedSensor.devices.forEach((device) => {
        for (let i  = 1 ; i<=device.size; i++) {
          // Update device-specific size
          if (!this.size[device.name]) {
            this.size[device.name] = 0;
          }
          this.size.total++;
          this.size[device.name] ++;
          peripherals.push({
            peripheral_device_id: this.size.total ,
            name: `${device.name}  ${this.size[device.name]}`,
            type: device.type
          });
        }
      });
      this.devices.set(index,peripherals);
    }
    return this.devices.get(index);
  }

  clear (){
    this.devices.clear();
    this.size = {
      total: 0
    }
  }

}
