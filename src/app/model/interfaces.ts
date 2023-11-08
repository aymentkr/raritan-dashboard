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
  poles: Pole[];
}

export interface SensorElement {
  name : string;
  type : string;
  generation : number;
  prefix : string;
  methods : any;
}

export interface InnerPeripheral {
  id : number,
  name : string,
  methodName : string
}
export interface Peripheral {
  id : number;
  name : string;
  type : string;
  serial_number : string;
  methods: InnerPeripheral[]
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
