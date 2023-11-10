import {DeviceElement} from "./interfaces";

export class PeripheralClass {

  devices: DeviceElement[] = [
    {
      size: 0,
      name: 'Temperature',
      type: 'Temperature',
    },
    {
      size: 0,
      name: 'Relative humidity',
      type: 'Humidity',
    },
    {
      size: 0,
      name: 'Absolute Humidity',
      type: 'Absolute Humidity',
    },
    {
      size: 0,
      name: 'Powered Dry Contact',
      type: 'Dry Contact',
    },
    {
      size: 0,
      name: 'On/Off',
      type: 'Contact Closure',
    },
    {
      size: 0,
      name: 'Hall Effect',
      type: 'Magnetic Contact',
    },
    {
      size : 0,
      name: 'Door State',
      type : 'Door State'
    },
    {
      size : 0,
      name: 'Door Handle',
      type : 'Handle State'
    },
    {
      size : 0,
      name: 'Door Lock',
      type : 'Door Lock'
    },
    {
      size : 0,
      name: 'Air Flow',
      type : 'Air Flow'
    },
    {
      size : 0,
      name: 'Vibration',
      type : 'Vibration'
    }
  ];
  length = 0;

  IncDevice(){
    this.length++;
    return this.length
  }

  getDevices(): DeviceElement[] {
    return this.devices;
  }

  clear() {
    this.length = 0;
  }
}
