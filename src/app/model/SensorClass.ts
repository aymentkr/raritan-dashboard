import {SensorElement} from "./interfaces";

export class SensorClass {
  deviceTypes: string[] = [
    'Air Flow',
    'Temperature',
    'Air Pressure',
    'Absolute Humidity',
    'Humidity',
    'Dew Point',
    'Dry Contact',
    'Contact Closure',
    'Magnetic Contact',
    'Motion Detected',
    'Tamper Alarm',
    'Door Lock',
    'Handle State',
    'Door State',
    'Vibration',
    'Water Detection',
    'Leak Distance',
    'Cable Length',
    'Particle Density',

  ];
  sensors: SensorElement[] = [
    {
      name: 'Air Flow 1',
      type: 'DPX_AF1',
      generation: 1,
      prefix: 'PRB',
      methods: ['setAirFlow'],
      devices: [{
        size:1,
        name: this.deviceTypes[0], // 'Air Flow'
        type: this.deviceTypes[0], // 'Air Flow'
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
        name: this.deviceTypes[0], // 'Air Flow'
        type: this.deviceTypes[0], // 'Air Flow'
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
        name: this.deviceTypes[1], // 'Temperature'
        type: this.deviceTypes[1], // 'Temperature'
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
        name: this.deviceTypes[1], // 'Temperature'
        type: this.deviceTypes[1], // 'Temperature'
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
        name: this.deviceTypes[1], // 'Temperature'
        type: this.deviceTypes[1], // 'Temperature'
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
          name: this.deviceTypes[1], // 'Temperature'
          type: this.deviceTypes[1], // 'Temperature'
        },
        {
          size:1,
          name: this.deviceTypes[2], // 'Air Pressure'
          type: this.deviceTypes[2], // 'Air Pressure'
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
          name: this.deviceTypes[1], // 'Temperature'
          type: this.deviceTypes[1], // 'Temperature'
        },
        {
          size:1,
          name: this.deviceTypes[2], // 'Air Pressure'
          type: this.deviceTypes[2], // 'Air Pressure'
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
          name: this.deviceTypes[1], // 'Temperature'
          type: this.deviceTypes[1], // 'Temperature'
        },
        {
          size: 1,
          name: this.deviceTypes[3], // 'Absolute Humidity'
          type: this.deviceTypes[3], // 'Absolute Humidity'
        },
        {
          size:1,
          name: 'Relative humidity',
          type: this.deviceTypes[4], // 'humidity'
        },
        {
          size: 1,
          name: this.deviceTypes[5], // 'Dew Point'
          type: this.deviceTypes[5], // 'Dew Point'
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
          name: this.deviceTypes[1], // 'Temperature'
          type: this.deviceTypes[1], // 'Temperature'
        },
        {
          size: 1,
          name: this.deviceTypes[3], // 'Absolute Humidity'
          type: this.deviceTypes[3], // 'Absolute Humidity'
        },
        {
          size:1,
          name: 'Relative humidity',
          type: this.deviceTypes[4], // 'humidity'
        },
        {
          size: 1,
          name: this.deviceTypes[5], // 'Dew Point'
          type: this.deviceTypes[5], // 'Dew Point'
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
          name: this.deviceTypes[1], // 'Temperature'
          type: this.deviceTypes[1], // 'Temperature'
        },
        {
          size: 1,
          name: this.deviceTypes[3], // 'Absolute Humidity'
          type: this.deviceTypes[3], // 'Absolute Humidity'
        },
        {
          size:1,
          name: 'Relative humidity',
          type: this.deviceTypes[4], // 'humidity'
        },
        {
          size: 1,
          name: this.deviceTypes[5], // 'Dew Point'
          type: this.deviceTypes[5], // 'Dew Point'
        }]
    },
    {
      name: 'Contact Closure',
      type: 'DX2_CC2',
      generation: 3,
      prefix: '1J7',
      methods: ['setContactClosure'],
      devices: [{
        size:2,
        name: 'On/Off',
        type: this.deviceTypes[7],
      }]
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
          name: this.deviceTypes[6], // 'Dry Contact'
          type: this.deviceTypes[6], // 'Dry Contact'
        },
        {
          size:5,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
        },
        {
          size: 1,
          name: 'Hall Effect',
          type: this.deviceTypes[8], // 'Magnetic Contact'
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
          name: this.deviceTypes[6], // 'Dry Contact'
          type: this.deviceTypes[6], // 'Dry Contact'
        },
        {
          size:5,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
        },
        {
          size: 1,
          name: 'Hall Effect',
          type: this.deviceTypes[8], // 'Magnetic Contact'
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
          name: this.deviceTypes[6], // 'Dry Contact'
          type: this.deviceTypes[6], // 'Dry Contact'
        },
        {
          size:5,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
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
          name: this.deviceTypes[6], // 'Dry Contact'
          type: this.deviceTypes[6], // 'Dry Contact'
        },
        {
          size:5,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
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
          name: this.deviceTypes[9], // 'Motion Detected'
          type: this.deviceTypes[9], // 'Motion Detected'
        },
        {
          size:1,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
        },
        {
          size:1,
          name: this.deviceTypes[10], // 'Tamper Alarm'
          type: this.deviceTypes[10], // 'Tamper Alarm'
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
          name: this.deviceTypes[9], // 'Motion Detected'
          type: this.deviceTypes[9], // 'Motion Detected'
        },
        {
          size:1,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
        },
        {
          size:1,
          name: this.deviceTypes[10], // 'Tamper Alarm'
          type: this.deviceTypes[10], // 'Tamper Alarm'
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
          name: this.deviceTypes[11], // 'Door Lock'
          type: this.deviceTypes[11], // 'Door Lock'
        },
        {
          size : 2,
          name: 'Door Handle',
          type: this.deviceTypes[12]
        },
        {
          size : 2,
          name: 'Door State',
          type: this.deviceTypes[13]
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
          name: this.deviceTypes[14], // 'Vibration'
          type: this.deviceTypes[14], // 'Vibration'
        },
        {
          size:1,
          name: 'On/Off',
          type: this.deviceTypes[7], // 'Contact Closure'
        }]
    },
    {
      name: 'Water Leakage Sensor',
      type: 'DX2_WS1',
      generation: 3,
      prefix: '28G',
      methods: ['setCableLength', 'setLeakDetected', 'setLeakDistance', 'setCableLengthInvalid', 'setLeakDistanceInvalid'],
      devices: [
        {
        size:1,
        name: 'Leakage Detector',
          type: this.deviceTypes[16], // 'Water Detection'
        },
        {
          size:1,
          name: 'Distance',
          type: this.deviceTypes[17], // 'Leak Distance'
        },
        {
          size:1,
          name: 'Length',
          type: this.deviceTypes[18], // 'Cable Length'
        },
      ]
    },
    {
      name: 'Particle Sensor',
      type: 'DX2_PS',
      generation: 3,
      prefix: '2D7',
      methods: ['setMassPM10', 'setMassPM25', 'setMassPM40', 'setMassPM100', 'setMassInvalid'],
      devices: [
        {
          size:1,
          name: 'Particle Density PM10.0',
          type: this.deviceTypes[19], // 'Particle Density
        },
        {
          size:1,
          name: 'Particle Density PM1.0',
          type: this.deviceTypes[19], // 'Particle Density
        },
        {
          size:1,
          name: 'Particle Density PM2.5',
          type: this.deviceTypes[19], // 'Particle Density
        },
        {
          size:1,
          name: 'Particle Density PM4.0',
          type: this.deviceTypes[19], // 'Particle Density
        },
      ]
    }
  ];

  constructor() {
  }

  getSensors(){
    return this.sensors;
  }

  getDeviceTypes() {
    return this.deviceTypes
  }
}
