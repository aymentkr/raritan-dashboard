import {MatTableDataSource} from "@angular/material/table";

export interface Outlet {
  id: number;
  state: boolean;
  voltage: number;
  frequency: number;
  current: number;
  act_power: number;
  app_power: number;
}

export interface Pole {
  id : number;
  name : string;
  voltage: number;
  current: number;
  act_power: number;
  app_power: number;
  act_energy: number;
  app_energy: number;
}

export interface Inlet {
  id: number;
  frequency: number;
  voltage: number;
  current: number;
  act_power: number;
  app_power: number;
  act_energy: number;
  app_energy: number;
}

export interface InletP {
  id: number;
  frequency: number;
  poles: Pole[];
}

export interface SensorElement {
  name : string;
  type : string;
  generation : number;
  prefix : string;
  methods : any;
  devices : DeviceElement[];
}
export interface DeviceElement {
  size : number,
  name : string,
  type: string,
}

export interface Peripheral {
  peripheral_id : number,
  name : string,
  type : string,
}

export interface VPD {
  peripheral_id :number,
  name : string,
  type : string,
  sensor_name : string,
  sensor_type : string,
  serial_number : string
}
export interface Device {
  type : string,
}
export interface DeviceNode {
  type: string;
  serial: string;
  tailports?: DeviceNode[];
}

export interface DeviceFlatNode {
  expandable: boolean;
  device_id : number;
  name : string
  type: string;
  serial_number: string;
  peripherals: MatTableDataSource<Peripheral>;
  level: number;
}

export interface Notification {
  title: string;
  time : string;
  message: string;
  alert: string;
}

export interface Ocp {
  id : number,
  status : boolean,
  current : number,
  peak_current : number,
}

export interface Switch {
  preferredInlet: number | null,
  BypassSelectedInlet: number | null,
  BypassActiveInlet: number | null,
  FaultFlags: number | null,
  Inlet1FaultFlags: number | null,
  Inlet2FaultFlags: number | null,
  InletPhaseAngle: number | null,
  PowerFailDetectTime: number | null,
  RelayOpenTime: number | null,
  TotalTransferTime: number | null,
}
