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
}
export interface DeviceElement {
  size : number,
  name : string,
  type: string,
}

export interface Peripheral {
  device_id : number,
  name : string,
  type : string,
  methodName : string
}
export interface SensorPort {
  id : number;
  name : string;
  type : string;
  serial_number : string;
  methods: MatTableDataSource<Peripheral>;
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
  preferredInlet: number,
  BypassSelectedInlet: number,
  BypassActiveInlet: number,
  FaultFlags: number,
  Inlet1FaultFlags: number,
  Inlet2FaultFlags: number,
  InletPhaseAngle: number,
  PowerFailDetectTime: number,
  RelayOpenTime: number,
  TotalTransferTime: number,
}
