import {Injectable} from '@angular/core';
import {Inlet, Outlet, Peripheral, Pole} from "../model/interfaces";
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
      }
      await this.delay(50);
      const messages = this.cleanData(this.WSS.getMessages());
      let index = 0;
      for (let i = 0; i < 3; i++) {
        poleData.push({
          id: i,
          voltage: parseFloat(messages[index]),
          current: parseFloat(messages[index + 1]),
          act_power: parseFloat(messages[index + 2]),
          app_power: parseFloat(messages[index + 3]),
        });
        index += 4;
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
      await  this.WSS.sendMessage('help()');
      await this.delay(50);
      const index = parseFloat(await this.WSS.getResult(`print(#outlets)`));
      this.WSS.clearMessages();
      const outlets: Outlet[] = [];
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
        outlets.push({
          id: id,
          state: messages[i] === 'true',
          voltage: parseFloat(messages[i + 1]),
          frequency: parseFloat(messages[i + 2]),
          current: parseFloat(messages[i + 3]),
          act_power: parseFloat(messages[i + 4]),
          app_power: parseFloat(messages[i + 5]),
        });
        i += 6;
        id++;
      }
      return outlets;
    } catch (error) {
      console.error('Error fetching outlet data:', error);
      throw error; // Rethrow the error to handle it in the catch block
    }
  }
  async fetchPeripheralData() {
    await  this.WSS.sendMessage('help()');
    await this.delay(50);
    this.WSS.clearMessages();
    await this.WSS.sendMessage(`print(sensorports[1]:listDevices())`);
    await this.delay(50);
    const peripherals: Peripheral[] = [];
    let i = 1;
    const lines = this.WSS.getMessages().toString().split('\n');
    for (const line of lines) {
      const match = line.match(/([A-Z0-9_]+): ([A-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const serialNumber = match[2];
        this.sensorData.getSensors().filter(item => {
          if (item.type === type) {
              peripherals.push({
                id : i,
                name: item.name,
                type: item.type,
                serial_number: serialNumber,
            });
              i++;
          }
        });
      }
    }
    return peripherals;
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
      console.log(inlet.id + inlet.frequency + inlet.poles.length);
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
