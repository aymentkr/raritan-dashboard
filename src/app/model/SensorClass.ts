import {SensorElement} from "./interfaces";

export class SensorClass {
    sensors: SensorElement[] = [
        {
            name: 'Air Flow 1',
            type: 'DPX_AF1',
            generation: 1,
            prefix: 'PRB',
            methods: ['setAirFlow']
        },
        {
            name: 'Air Flow 2',
            type: 'DX2_AF1',
            generation: 3,
            prefix: '236',
            methods: ['setAirFlow', 'setAirFlowInvalid']
        },
        {
            name: 'Temperature 1',
            type: 'DPX_T1',
            generation: 1,
            prefix: 'AEH',
            methods: ['setTemperature']
        },
        {
            name: 'Temperature 2',
            type: 'DPX2_T1',
            generation: 2,
            prefix: 'QMT',
            methods: ['setTemperature']
        },
        {
            name: 'Temperature 3',
            type: 'DX2_T1',
            generation: 3,
            prefix: '1JX',
            methods: ['setTemperature', 'setTemperatureInvalid']
        },
        {
            name: 'Temperature/Differential Air Pressure 1',
            type: 'DPX_T1DP1',
            generation: 1,
            prefix: 'PJ8',
            methods: ['setTemperature', 'setAirPressure']
        },
        {
            name: 'Temperature/Differential Air Pressure 2',
            type: 'DPX2_T1DP1',
            generation: 3,
            prefix: '23A',
            methods: ['setTemperature', 'setAirPressure', 'setTemperatureInvalid', 'setAirPressureInvalid']
        },
        {
            name: 'Temperature/Humidity 1',
            type: 'DPX_T1H1',
            generation: 1,
            prefix: 'AEI',
            methods: ['setTemperature', 'setHumidity']
        },
        {
            name: 'Temperature/Humidity 2',
            type: 'DPX2_T1H1',
            generation: 2,
            prefix: 'AEI',
            methods: ['setTemperature', 'setHumidity']
        },
        {
            name: 'Temperature/Humidity 3',
            type: 'DX2_T1H1',
            generation: 3,
            prefix: '1EQ',
            methods: ['setTemperature', 'setHumidity', 'setTemperatureInvalid', 'setHumidityInvalid']
        },
        {
            name: 'Dry Contact/Contact Closure 1',
            type: 'DX_D2C6',
            generation: 2,
            prefix: 'QLL',
            methods: ['setContactClosure', 'setDryContact', 'setMagneticContact']
        },
        {
            name: 'Dry Contact/Contact Closure 2',
            type: 'DX2_D2C6',
            generation: 3,
            prefix: '2DG',
            methods: ['setContactClosure', 'setDryContact', 'setMagneticContact']
        },
        {
            name: 'Powered Dry Contact/Contact Closure 1',
            type: 'DX_PD2C5',
            generation: 2,
            prefix: 'QU7',
            methods: ['setContactClosure', 'setDryContact']
        },
        {
            name: 'Powered Dry Contact/Contact Closure 2',
            type: 'DX2_PD2C5',
            generation: 3,
            prefix: '2DH',
            methods: ['setContactClosure', 'setDryContact']
        },
        {
            name: 'Motion Detector 1',
            type: 'DX_PIR',
            generation: 2,
            prefix: 'QMQ',
            methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm']
        },
        {
            name: 'Motion Detector 2',
            type: 'DX2_PIR',
            generation: 3,
            prefix: '2DF',
            methods: ['setMotionDetected', 'setContactClosure2', 'setTamperAlarm']
        },
        {
            name: 'Doorhandle Controller',
            type: 'DX2_DH2C2',
            generation: 3,
            prefix: '1GE',
            methods: ['setDoorState', 'setHandleState', 'setCardId', 'setPIN']
        },
        {
            name: 'Vibration Sensor',
            type: 'DX2_VBR',
            generation: 3,
            prefix: '2DE',
            methods: ['setVibration', 'setContactClosure2', 'setVibrationInvalid']
        },
        {
            name: 'Water Leakage Sensor',
            type: 'DX2_WS1',
            generation: 3,
            prefix: '28G',
            methods: ['setCableLength', 'setLeakDetected', 'setLeakDistance', 'setCableLengthInvalid', 'setLeakDistanceInvalid']
        },
        {
            name: 'Particle Sensor',
            type: 'DX2_PS',
            generation: 3,
            prefix: '2D7',
            methods: ['setMassPM10', 'setMassPM25', 'setMassPM40', 'setMassPM100', 'setMassInvalid']
        }
    ];

    getSensors(): SensorElement[] {
        return this.sensors;
    }
}
