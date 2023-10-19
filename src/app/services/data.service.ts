import {Injectable} from '@angular/core';
import {Envhub, Inlet, Ocp, Outlet, Peripheral, Pole} from "../model/interfaces";
import {WebsocketService} from "./websocket.service";
import {SensorService} from "./sensor.service";


@Injectable({
  providedIn: 'root',
})
export class DataService {
  hasPoles : boolean= true;

  options: { name: string; isEnabled: boolean }[] = [
    { name: '1', isEnabled: true },
    { name: '2', isEnabled: true },
    { name: '3', isEnabled: true }
  ];

  constructor(private WSS: WebsocketService, private sensorData: SensorService) {
  }

  async init() {
    await this.WSS.sendMessage('print()');
    await this.delay(50);
  }
  async fetchInletData(): Promise<Inlet[]> {
    await this.init();
    const inlets: Inlet[] = [];
    const index = await this.WSS.getResult('print(#inlets)');
    const test = await this.WSS.getResult(`print(inlets[1]:getVoltage(0))`);
    this.hasPoles = !isNaN(test);
    if (index > 0) {
      if (this.hasPoles) {
        for (let i = 1; i <= index; i++) {
          const frequency = await this.WSS.getResult(`print(inlets[${i}]:getFrequency())`);
          if (isNaN(frequency)) return this.fetchInletData();
          else {
            await this.fetchPoleData(i)
              .then(async (data: Pole[]) => {
                  inlets.push({
                    id: i,
                    frequency: frequency,
                    poles: data,
                  });
                }
              )
          }
        }
      } else {
        this.WSS.clearMessages();
        for (let i = 1; i <= index; i++) {
          await this.WSS.sendMessage(`print(inlets[${i}]:getFrequency())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getVoltage())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getCurrent())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getActivePower())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getApparentPower())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getActiveEnergy())`);
          await this.WSS.sendMessage(`print(inlets[${i}]:getApparentEnergy())`);
        }
        await this.delay(50);
        let i = 0, id = 1;
        const messages = this.cleanData(this.WSS.getMessages());
        while (i < messages.length) {
          const frequency = parseFloat(messages[i]);
          const voltage = parseFloat(messages[i + 1]);
          const current = parseFloat(messages[i + 2]);
          const act_power = parseFloat(messages[i + 3]);
          const app_power = parseFloat(messages[i + 4]);
          const act_energy = parseFloat(messages[i + 5]);
          const app_energy = parseFloat(messages[i + 6]);
          if (
            isNaN(voltage) ||
            isNaN(frequency) ||
            isNaN(current) ||
            isNaN(act_power) ||
            isNaN(app_power) ||
            isNaN(act_energy) ||
            isNaN(app_energy)
          ) {
            return this.fetchInletData();
          }
          inlets.push({
            id: id,
            frequency: frequency,
            poles : [{
              id : id,
              name : 'L0',
              voltage: voltage,
              current: current,
              act_power: act_power,
              app_power: app_power,
              act_energy: act_energy,
              app_energy:app_energy
            }]
          });
          i += 7;
          id++;
        }
      }
    }
      return inlets
  }


  async fetchPoleData(size:number): Promise<Pole[]> {
    this.WSS.clearMessages();
    const poles: Pole[] = [];
    for (let i = 0; i < 6; i++) {
      await this.WSS.sendMessage(`print(inlets[${size}]:getVoltage(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getCurrent(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getActivePower(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getApparentPower(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getActiveEnergy(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getApparentEnergy(${i}))`);
    }
    await this.delay(50);
    let i = 0, id = 0;
    const pole_numbers =['L1','L2','L3','L1-L3','L2-L3','L3-L1'];
    const messages = this.cleanData(this.WSS.getMessages());
    while (i < messages.length) {
      const voltage = parseFloat(messages[i]);
      const current = parseFloat(messages[i + 1]);
      const act_power = parseFloat(messages[i + 2]);
      const app_power = parseFloat(messages[i + 3]);
      const act_energy = parseFloat(messages[i + 4]);
      const app_energy = parseFloat(messages[i + 5]);
      if (
        isNaN(voltage) ||
        isNaN(current) ||
        isNaN(act_power) ||
        isNaN(app_power) ||
        isNaN(act_energy) ||
        isNaN(app_energy)
      ) {
        return this.fetchPoleData(size);
      }
      poles.push({
        id: id,
        name: pole_numbers[id],
        voltage: voltage,
        current: current,
        act_power: act_power,
        app_power: app_power,
        act_energy: act_energy,
        app_energy: app_energy,
      });
      i += 6;
      id++;
    }
    return poles;
  }

  async fetchOutletData(): Promise<Outlet[]> {
    try {
      await this.init();
      const outlets: Outlet[] = [];
      const index = await this.WSS.getResult('print(#outlets)');
      this.WSS.clearMessages();
      for (let i = 1; i <= index; i++) {
        await this.WSS.sendMessage(`print(outlets[${i}]:getState())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getVoltage())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getFrequency())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getCurrent())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getActivePower())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getApparentPower())`);
      }
      await this.delay(50);
      let i = 0, id = 1;
      const messages = this.cleanData(this.WSS.getMessages());
      while (i < messages.length) {
        const voltage = parseFloat(messages[i + 1]);
        const frequency = parseFloat(messages[i + 2]);
        const current = parseFloat(messages[i + 3]);
        const act_power = parseFloat(messages[i + 4]);
        const app_power = parseFloat(messages[i + 5]);
        if (
          isNaN(voltage) ||
          isNaN(frequency) ||
          isNaN(current) ||
          isNaN(act_power) ||
          isNaN(app_power)
        ) {
          return this.fetchOutletData();
        }

        outlets.push({
          id: id,
          state: messages[i] === 'true',
          voltage: voltage,
          frequency: frequency,
          current: current,
          act_power: act_power,
          app_power: app_power,
        });
        i += 6;
        id++;
      }
      return outlets;
    } catch (error) {
      console.error('Error fetching outlet data:', error);
      throw error;
    }
  }

  async fetchPeripheralData() {
    let peripherals: Peripheral[] = [];
    await this.init();
    const index = await this.WSS.getResult('print(#sensorports)');
    if (index == 1){
      this.WSS.clearMessages();
      await this.WSS.sendMessage('print(sensorports[1]:listDevices())');
      await this.delay(50);
      const lines = this.WSS.getMessages().toString().split('\n');
      peripherals = this.convertLinesToPeripherals(lines);
    }
    return peripherals;
  }

  async fetchEnvhubsData() {
    const peripherals:Envhub = {};
    await this.init();
    const index = await this.WSS.getResult('print(#envhubs)');
    if (index == 1){
      this.WSS.clearMessages();
      for (let i = 0; i < 4; i++) {
        await this.WSS.sendMessage(`print(envhubs[1]:getPort(${i}):listDevices())`);
      }
      await this.delay(50);
      let i=0,  p = 0;
      while (i < this.WSS.getMessages().length){
        if (this.WSS.getMessages()[i].length > 3){
          const lines = this.WSS.getMessages()[i].split('\n');
          peripherals[p] = this.convertLinesToPeripherals(lines);
          p++;
        }
        i++;
      }
    }
    return {
      ...peripherals,
    };
  }


  convertLinesToPeripherals(lines: string[]):Peripheral[]{
    const peripherals: Peripheral[] = [];
    let index=1;
    for (const line of lines) {
      const match = line.match(/([A-Z0-9_]+): ([A-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const serialNumber = match[2];
        this.sensorData.getSensors().filter(item => {
          if (item.type === type) {
            peripherals.push({
              id: index,
              name: item.name,
              type: item.type,
              serial_number: serialNumber,
            });
            index++;
          }
        });
      }
    }
    return peripherals;
  }
  async fetchSmartLockData() {
    const type = 'DX2_DH2C2';
    let peripherals = await this.fetchPeripheralData();
    let envhubs = await this.fetchEnvhubsData();
    if (peripherals.length === 0 && Object.keys(envhubs).length === 0){
      return [];
    } else {
      peripherals = peripherals.filter((peripheral) => peripheral.type === type);
      const filteredEnvhubData = envhubs[0]
        .concat(envhubs[1], envhubs[2], envhubs[3])
        .filter((peripheral) => peripheral.type === type);
      return peripherals.concat(filteredEnvhubData);
    }
  }


  async fetchOcpData() : Promise<Ocp[]> {
    try {
      await this.init();
      const ocps: Ocp[] = [];
      const index = await this.WSS.getResult('print(#ocps)')
      this.WSS.clearMessages();
      for (let i = 1; i <= index; i++) {
        await this.WSS.sendMessage(`print(ocps[${i}]:isClosed())`);
        await this.WSS.sendMessage(`print(ocps[${i}]:getCurrent())`);
        await this.WSS.sendMessage(`print(ocps[${i}]:getPeakCurrent())`);
      }
      await this.delay(50);
      let i = 0, id = 1;
      const messages = this.cleanData(this.WSS.getMessages());
      while (i < messages.length) {
        const current = parseFloat(messages[i+1]);
        const peak_current = parseFloat(messages[i+2]);
        if ( isNaN(current) || isNaN(peak_current)) {
          return this.fetchOcpData();
        }

        ocps.push({
          id : id,
          status: messages[i] === 'true',
          current: current,
          peak_current: peak_current,
        });
        i += 3;
        id++;
      }
      return ocps;
    } catch (error) {
      console.error('Error fetching ocp data:', error);
      throw error;
    }
  }



  async editOcp(ocp: Ocp) {
    if (ocp != null) {
      await this.WSS.sendMessage(`ocps[${ocp.id}]:setCurrent(${ocp.current});`);
      await this.WSS.sendMessage(`ocps[${ocp.id}]:setPeakCurrent(${ocp.peak_current});`);
    } else {
      throw new Error('outlet is null');
    }
  }




  async editOutlet(outlet: Outlet): Promise<void> {
    if (outlet!=null) {
      await this.WSS.sendMessage(`outlets[${outlet.id}]:setVoltage(${outlet.voltage});`);
      await this.WSS.sendMessage(`outlets[${outlet.id}]:setFrequency(${outlet.frequency});`);
      await this.WSS.sendMessage(`outlets[${outlet.id}]:setCurrent(${outlet.current});`);
      await this.WSS.sendMessage(`outlets[${outlet.id}]:setActivePower(${outlet.act_power});`);
      await this.WSS.sendMessage(`outlets[${outlet.id}]:setApparentPower(${outlet.app_power});`);
    } else {
      throw new Error('outlet is null');
    }
  }

  async editInlet(inlet: Inlet): Promise<void> {
    if (inlet!=null) {
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setFrequency(${inlet.frequency});`);
    } else {
      throw new Error('inlet is null');
    }
  }


  async editPole(inlet: Inlet,pole: Pole, hasPoles:boolean): Promise<void> {
    if (pole!=null && inlet!=null) {
      if (hasPoles) {
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setVoltage(${pole.id},${pole.voltage});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setCurrent(${pole.id},${pole.current});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setActivePower(${pole.id},${pole.act_power});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setApparentPower(${pole.id},${pole.app_power});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:addActiveEnergy(${pole.id},${pole.act_energy});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:addApparentEnergy(${pole.id},${pole.app_energy});`);
      } else {
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setVoltage(${pole.voltage});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setCurrent(${pole.current});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setActivePower(${pole.act_power});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:setApparentPower(${pole.app_power});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:addActiveEnergy(${pole.act_energy});`);
        await this.WSS.sendMessage(`inlets[${inlet.id}]:addApparentEnergy(${pole.app_energy});`);
      }
    } else {
      throw new Error('pole is null');
    }
  }


  cleanData(dataList: string[]): string[] {
    // Regular expression to match numbers, "true," or "false"
    const regex = /\b(\d+(\.\d+)?|true|false)\b/g;
    for (let i = 0; i < dataList.length; i++) {
      const matches = dataList[i].match(regex);
      if (matches) {
        dataList[i] = matches.join(' ');
      } else {
        dataList.splice(i, 1);
        i--;
      }
    }
    return dataList;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  isInlet_P() {
    return this.hasPoles;
  }

}
