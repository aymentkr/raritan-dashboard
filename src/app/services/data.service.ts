import {Injectable} from '@angular/core';
import {Envhub, Ocp, Peripheral} from "../model/interfaces";
import {WebsocketService} from "./websocket.service";
import {SensorsPipe} from "../pipes/sensors.pipe";


@Injectable({
  providedIn: 'root',
})
export class DataService {


  options: { name: string; isEnabled: boolean }[] = [
    { name: '1', isEnabled: true },
    { name: '2', isEnabled: true },
    { name: '3', isEnabled: true }
  ];

  constructor(private WSS: WebsocketService, private sp: SensorsPipe,) {
  }


  async fetchPeripheralData() {
    let peripherals: Peripheral[] = [];
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
        this.sp.getSensors().filter(item => {
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


}
