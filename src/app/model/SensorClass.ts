import {SensorElement} from "./interfaces";

export class SensorClass {
  sensors: SensorElement[] = [
    {
      name: 'Air Flow 1',
      type: 'DPX_AF1',
      generation: 1,
      prefix: 'PRB',
      methods: ['setAirFlow'],
      devices: [{
        size:1,
        name: 'Air Flow',
        type: 'Air Flow',
      }]
    },
    {
      name: 'Air Flow 2',
      type: 'DX2_AF1',
      generation: 3,
      prefix: '236',
      methods: ['setAirFlow', 'setAirFlowInvalid'],
      devices: [{
        size:1,
        name: 'Air Flow',
        type: 'Air Flow',
      }]
    },
    {
      name: 'Temperature 1',
      type: 'DPX_T1',
      generation: 1,
      prefix: 'AEH',
      methods: ['setTemperature'],
      devices: [{
        size:1,
        name: 'Temperature',
        type: 'Temperature',
      }]
    },
    {
      name: 'Temperature 2',
      type: 'DPX2_T1',
      generation: 2,
      prefix: 'QMT',
      methods: ['setTemperature'],
      devices: [{
        size:1,
        name: 'Temperature',
        type: 'Temperature',
      }]
    },
    {
      name: 'Temperature 3',
      type: 'DX2_T1',
      generation: 3,
      prefix: '1JX',
      methods: ['setTemperature', 'setTemperatureInvalid'],
      devices: [{
        size:1,
        name: 'Temperature',
        type: 'Temperature',
      }]
    },
    {
      name: 'Temperature/Differential Air Pressure 1',
      type: 'DPX_T1DP1',
      generation: 1,
      prefix: 'PJ8',
      methods: ['setTemperature', 'setAirPressure'],
      devices: [
        {
        size:1,
        name: 'Temperature',
        type: 'Temperature',
        },
        {
          size:1,
          name: 'Air Pressure',
          type: 'Air Pressure',
        }]
    },
    {
      name: 'Temperature/Differential Air Pressure 2',
      type: 'DPX2_T1DP1',
      generation: 3,
      prefix: '23A',
      methods: ['setTemperature', 'setAirPressure', 'setTemperatureInvalid', 'setAirPressureInvalid'],
      devices: [
        {
          size:1,
          name: 'Temperature',
          type: 'Temperature',
        },
        {
          size:1,
          name: 'Air Pressure',
          type: 'Air Pressure',
        }]
    },
    {
      name: 'Temperature/Humidity 1',
      type: 'DPX_T1H1',
      generation: 1,
      prefix: 'AEI',
      methods: ['setTemperature', 'setHumidity'],
      devices: [
        {
          size:1,
          name: 'Temperature',
          type: 'Temperature',
        },
        {
          size: 1,
          name: 'Absolute Humidity',
          type: 'Absolute Humidity',
        },
        {
          size:1,
          name: 'Relative humidity',
          type: 'Humidity',
        }]
    },
    {
      name: 'Temperature/Humidity 2',
      type: 'DPX2_T1H1',
      generation: 2,
      prefix: 'AEI',
      methods: ['setTemperature', 'setHumidity'],
      devices: [
        {
          size:1,
          name: 'Temperature',
          type: 'Temperature',
        },
        {
          size: 1,
          name: 'Absolute Humidity',
          type: 'Absolute Humidity',
        },
        {
          size:1,
          name: 'Relative humidity',
          type: 'Humidity',
        }]
    },
    {
      name: 'Temperature/Humidity 3',
      type: 'DX2_T1H1',
      generation: 3,
      prefix: '1EQ',
      methods: ['setTemperature', 'setHumidity', 'setTemperatureInvalid', 'setHumidityInvalid'],
      devices: [
        {
          size:1,
          name: 'Temperature',
          type: 'Temperature',
        },
        {
          size:1,
          name: 'Relative humidity',
          type: 'Humidity',
        },
        {
          size: 1,
          name: 'Absolute Humidity',
          type: 'Absolute Humidity',
        },]
    },
    {
      name: 'Dry Contact/Contact Closure 1',
      type: 'DX_D2C6',
      generation: 2,
      prefix: 'QLL',
      methods: ['setContactClosure', 'setDryContact', 'setMagneticContact'],
      devices: [
        {
          size:2,
          name: 'Dry Contact',
          type: 'Dry Contact',
        },
        {
          size:5,
          name: 'On/Off',
          type: 'Contact Closure',
        },
        {
          size: 1,
          name: 'Hall Effect',
          type: 'Magnetic Contact',
        }]
    },
    {
      name: 'Dry Contact/Contact Closure 2',
      type: 'DX2_D2C6',
      generation: 3,
      prefix: '2DG',
      methods: ['setContactClosure', 'setDryContact', 'setMagneticContact'],
      devices: [
        {
          size:2,
          name: 'Dry Contact',
          type: 'Dry Contact',
        },
        {
          size:5,
          name: 'On/Off',
          type: 'Contact Closure',
        },
        {
          size: 1,
          name: 'Hall Effect',
          type: 'Magnetic Contact',
        }]
    },
    {
      name: 'Powered Dry Contact/Contact Closure 1',
      type: 'DX_PD2C5',
      generation: 2,
      prefix: 'QU7',
      methods: ['setContactClosure', 'setDryContact'],
      devices: [
        {
          size:2,
          name: 'Dry Contact',
          type: 'Dry Contact',
        },
        {
          size:5,
          name: 'On/Off',
          type: 'Contact Closure',
        }]
    },
    {
      name: 'Powered Dry Contact/Contact Closure 2',
      type: 'DX2_PD2C5',
      generation: 3,
      prefix: '2DH',
      methods: ['setContactClosure', 'setDryContact'],
      devices: [
        {
          size:2,
          name: 'Dry Contact',
          type: 'Dry Contact',
        },
        {
          size:5,
          name: 'On/Off',
          type: 'Contact Closure',
        }]
    },
    {
      name: 'Motion Detector 1',
      type: 'DX_PIR',
      generation: 2,
      prefix: 'QMQ',
      methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm'],
      devices: [
        {
          size:1,
          name: 'Motion Detected',
          type: 'Motion Detected',
        },
        {
          size:1,
          name: 'On/Off',
          type: 'Contact Closure',
        },
        {
          size:1,
          name: 'Tamper Alarm',
          type: 'Tamper Alarm',
        }]
    },
    {
      name: 'Motion Detector 2',
      type: 'DX2_PIR',
      generation: 3,
      prefix: '2DF',
      methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm'],
      devices: [
        {
          size:1,
          name: 'Motion Detected',
          type: 'Motion Detected',
        },
        {
          size:1,
          name: 'On/Off',
          type: 'Contact Closure',
        },
        {
          size:1,
          name: 'Tamper Alarm',
          type: 'Tamper Alarm',
        }]
    },
    {
      name: 'Doorhandle Controller',
      type: 'DX2_DH2C2',
      generation: 3,
      prefix: '1GE',
      methods: ['setDoorState', 'setHandleState', 'setCardId', 'setPIN'],
      devices: [
        {
          size:2,
          name: 'Door Lock',
          type : 'Door Lock'
        },
        {
          size : 2,
          name: 'Door Handle',
          type : 'Handle State'
        },
        {
          size : 2,
          name: 'Door State',
          type : 'Door State'
        },
      ]
    },
    {
      name: 'Vibration Sensor',
      type: 'DX2_VBR',
      generation: 3,
      prefix: '2DE',
      methods: ['setVibration', 'setContactClosure2', 'setVibrationInvalid'],
      devices: [
        {
          size:1,
          name: 'Vibration',
          type: 'Vibration',
        },
        {
          size:1,
          name: 'On/Off',
          type: 'Contact Closure',
        }]
    },
    {
      name: 'Water Leakage Sensor',
      type: 'DX2_WS1',
      generation: 3,
      prefix: '28G',
      methods: ['setCableLength', 'setLeakDetected', 'setLeakDistance', 'setCableLengthInvalid', 'setLeakDistanceInvalid'],
      devices: []
    },
    {
      name: 'Particle Sensor',
      type: 'DX2_PS',
      generation: 3,
      prefix: '2D7',
      methods: ['setMassPM10', 'setMassPM25', 'setMassPM40', 'setMassPM100', 'setMassInvalid'],
      devices: []
    }
  ];

  getSensors(): SensorElement[] {
    return this.sensors;
  }
}
