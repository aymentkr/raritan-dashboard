import { Pipe, PipeTransform } from '@angular/core';
import {WebsocketService} from "../services/websocket.service";
import {Outlet} from "../model/interfaces";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'outlets', pure:true
})
export class OutletsPipe implements PipeTransform {

  constructor(private WSS: WebsocketService,private ds: DataService) {
  }

  async fetchOutletData(): Promise<Outlet[]> {
    try {
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
      await this.ds.delay(50);
      let i = 0, id = 1;
      const messages = this.ds.cleanData(this.WSS.getMessages());
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

  transform(): Promise<Outlet[]> {
    return this.fetchOutletData();
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

}
