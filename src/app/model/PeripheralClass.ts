import {Peripheral, SensorElement} from "./interfaces";

interface Size {
  total: number;
  [deviceName: string]: number;
}

export class PeripheralClass {
  size: Size = {
    total: 0,
  };
  constructor() {
  }
  getDevices(selectedSensor: SensorElement) {
    const peripherals:Peripheral[] = [];
    selectedSensor.devices.forEach((device) => {
      this.size.total+=device.size;
      for (let i  = 1 ; i<=device.size; i++) {
        // Update device-specific size
        if (!this.size[device.name]) {
          this.size[device.name] = 0;
        }
        this.size[device.name] ++;
        peripherals.push({
          peripheral_id: this.size.total ,
          name: `${device.name}  ${this.size[device.name]}`,
          type: device.type
        });
      }
    });
    return peripherals
  }

}
