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

/*
    'Door State', 'Door Handle','Door Lock',
    'Air Flow',
    'Vibration',''*/
  ];

  getDevices(): DeviceElement[] {
    return this.devices;
  }
}
