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
  voltage: number;
  current: number;
  act_power: number;
  app_power: number;
}

export interface Inlet {
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
export interface Peripheral {
  id : number;
  name : string;
  type : string;
  serial_number : string;
}
