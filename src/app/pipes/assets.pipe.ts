import {OnInit, Pipe, PipeTransform} from '@angular/core';
import {AssetInput, AssetOutput, SlideToggle} from "../model/interfaces";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'assets'
})
export class AssetsPipe implements PipeTransform {
  isAvailable: boolean = false;
  AssetOut!: AssetOutput;
  controls: SlideToggle[] = [
    {name: '1', isEnabled: true, table: 'ctrls'},
    {name: '2', isEnabled: true, table: 'ctrls'},
    {name: '3', isEnabled: true, table: 'ctrls'}
  ];
  connections: SlideToggle[] = [
    {name: 'Asset strips', table: 'assetstrips[1]', isEnabled: true},
    {name: 'External Beeper', table: 'extbeeper', isEnabled: false},
    {name: 'Power CIM', table: 'powercim', isEnabled: false}
  ];

  constructor(private data: DataService) {
  }

  transform(value: unknown, ...args: unknown[]): AssetOutput {
    return this.AssetOut;
  }

  async init() {
    for (let i = this.connections.length - 1; i >= 0; i--) {
      if (await this.data.getResult(this.connections[i].table, `print(${this.connections[i].table})`) === 'nil') {
        this.connections.splice(i, 1);
      } else if (i === 0) {
        this.isAvailable = true;
      }
    }
  }

}
