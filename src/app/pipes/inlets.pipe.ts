import { Pipe, PipeTransform } from '@angular/core';
import {Inlet, Pole} from "../model/interfaces";
import {WebsocketService} from "../services/websocket.service";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'inlets'
})
export class InletsPipe implements PipeTransform {
  hasPoles : boolean= true;

  constructor(private WSS: WebsocketService,private ds: DataService) {

  }

  async fetchInletData(): Promise<Inlet[]> {
    const inlets: Inlet[] = [];/*
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
        await this.ds.delay(50);
        let i = 0, id = 1;
        const messages = this.ds.cleanData(this.WSS.getMessages());
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
    this.WSS.unsubscribe();*/
    return inlets
  }


  async fetchPoleData(size:number): Promise<Pole[]> {
    const poles: Pole[] = [];/*
    for (let i = 0; i < 6; i++) {
      await this.WSS.sendMessage(`print(inlets[${size}]:getVoltage(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getCurrent(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getActivePower(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getApparentPower(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getActiveEnergy(${i}))`);
      await this.WSS.sendMessage(`print(inlets[${size}]:getApparentEnergy(${i}))`);
    }
    await this.ds.delay(50);
    let i = 0, id = 0;
    const pole_numbers =['L1','L2','L3','L1-L3','L2-L3','L3-L1'];
    const messages = this.ds.cleanData(this.WSS.getMessages());
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
    }*/
    return poles;
  }


  transform(): Promise<Inlet[]>  {
    return this.fetchInletData();
  }


  async editInlet(inlet: Inlet): Promise<void> {/*
    if (inlet!=null) {
      await this.WSS.sendMessage(`inlets[${inlet.id}]:setFrequency(${inlet.frequency});`);
    } else {
      throw new Error('inlet is null');
    }*/
  }


  async editPole(inlet: Inlet,pole: Pole, hasPoles:boolean): Promise<void> {/*
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
    }*/
  }

  isInlet_P() {
    return this.hasPoles;
  }
}
