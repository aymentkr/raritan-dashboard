import {Injectable} from '@angular/core';
import {Envhub, Inlet, Outlet, Peripheral, Pole} from "../model/interfaces";
import {WebsocketService} from "./websocket.service";
import {SensorService} from "./sensor.service";


@Injectable({
  providedIn: 'root',
})
export class DataService {
  historicalInletData: any[] = [];

  options: { name: string; isEnabled: boolean }[] = [
    { name: '1', isEnabled: true },
    { name: '2', isEnabled: true },
    { name: '3', isEnabled: true }
  ];

  constructor(private WSS: WebsocketService, private sensorData: SensorService) {
  }
  async fetchInletData(): Promise<Inlet> {
    try {
      await  this.WSS.sendMessage('help()');
      await this.delay(50);
      const frequency = parseFloat(await this.WSS.getResult(`print(inlets[1]:getFrequency())`));
      this.WSS.clearMessages();
      const poleData = [];
      for (let i = 0; i < 3; i++) {
        await this.WSS.sendMessage(`print(inlets[1]:getVoltage(${i}))`);
        await this.WSS.sendMessage(`print(inlets[1]:getCurrent(${i}))`);
        await this.WSS.sendMessage(`print(inlets[1]:getActivePower(${i}))`);
        await this.WSS.sendMessage(`print(inlets[1]:getApparentPower(${i}))`);
        await this.WSS.sendMessage(`print(inlets[1]:getActiveEnergy(${i}))`);
        await this.WSS.sendMessage(`print(inlets[1]:getApparentEnergy(${i}))`);
        await this.delay(50);
      }
      const messages = this.cleanData(this.WSS.getMessages());
      let index = 0;
      for (let i = 0; i < 3; i++) {
        poleData.push({
          id: i,
          voltage: parseFloat(messages[index]),
          current: parseFloat(messages[index + 1]),
          act_power: parseFloat(messages[index + 2]),
          app_power: parseFloat(messages[index + 3]),
          act_energy: parseFloat(messages[index + 4]),
          app_energy: parseFloat(messages[index + 5]),
        });
        index += 6;
      }

      return {
        id: 1,
        frequency,
        poles: poleData,
      };
    } catch (error) {
      console.error('Error fetching inlet data:', error);
      throw error; // Rethrow the error to handle it in the catch block
    }
  }

  async fetchOutletData(): Promise<Outlet[]> {
    try {
      this.WSS.clearMessages();
      const outlets: Outlet[] = [];
      for (let i = 1; i <= 36; i++) {
        await this.WSS.sendMessage(`print(outlets[${i}]:getState())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getVoltage())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getFrequency())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getCurrent())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getActivePower())`);
        await this.WSS.sendMessage(`print(outlets[${i}]:getApparentPower())`);
      }
      await this.delay(50);
      let i = 0,
        id = 1;
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
    await  this.WSS.sendMessage('help()');
    await this.delay(50);
    this.WSS.clearMessages();
    await this.WSS.sendMessage(`print(sensorports[1]:listDevices())`);
    await this.delay(50);
    const lines = this.WSS.getMessages().toString().split('\n');
    return this.convertLinesToPeripherals(lines);
  }

  async fetchEnvhubsData() {
    await this.WSS.sendMessage('help()');
    await this.delay(50);
    this.WSS.clearMessages();
    const peripherals:Envhub = {};
    for (let i = 0; i < 4; i++) {
      await this.WSS.getResult(`print(envhubs[1]:getPort(${i}):listDevices())`).then((data:string) => {
            peripherals[i] = this.convertLinesToPeripherals(data.split('\n'));
      })
        await this.delay(50);
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
    peripherals = peripherals.filter((peripheral) => peripheral.type === type);
    const filteredEnvhubData = envhubs[0]
      .concat(envhubs[1], envhubs[2], envhubs[3])
      .filter((peripheral) => peripheral.type === type);
    return peripherals.concat(filteredEnvhubData);
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


  async editPole(inlet: Inlet,pole: Pole): Promise<void> {
    if (pole!=null && inlet!=null) {
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setVoltage(${pole.id},${pole.voltage});`);
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setCurrent(${pole.id},${pole.current});`);
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setActivePower(${pole.id},${pole.act_power});`);
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setApparentPower(${pole.id},${pole.app_power});`);
      await this.WSS.sendMessage(`inlets[${inlet.id}]:addActiveEnergy(${pole.id},${pole.act_energy});`);
      await this.WSS.sendMessage(`inlets[${inlet.id}]:addApparentEnergy(${pole.id},${pole.app_energy});`);
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

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  updateHistoricalInletData(data: Inlet) {
    this.historicalInletData.push(data);
  }

  getHistoricalInletData() {
    return this.historicalInletData;
  }
}
