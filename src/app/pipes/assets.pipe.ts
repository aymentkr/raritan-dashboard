import {OnInit, Pipe, PipeTransform} from '@angular/core';
import {AssetInput, AssetOutput, SlideToggle} from "../model/interfaces";
import {DataService} from "../services/data.service";

@Pipe({
  name: 'assets'
})
export class AssetsPipe implements OnInit,PipeTransform{
  isAvailable!: boolean;
  AssetIn?: AssetInput;
  AssetOut!: AssetOutput;
  controls: SlideToggle[] = [
    { name: '1', isEnabled: true, table:'ctrls'},
    { name: '2', isEnabled: true, table:'ctrls'},
    { name: '3', isEnabled: true, table:'ctrls'}
  ];
  connections: SlideToggle[] = [];

  constructor(private data: DataService) {
  }
  async ngOnInit(): Promise<void> {
    await this.init();
    this.isAvailable = this.connections.length > 0;
  }
  async init() {
    const list: SlideToggle[] = [
      {name: 'Asset strips', table: 'assetstrips[1]', isEnabled: true},
      {name: 'External Beeper', table: 'extbeeper', isEnabled: false},
      {name: 'Power CIM', table: 'powercim', isEnabled: false}
    ];
    for (let i = 0; i < 3; i++) {
      if (await this.data.getResult(list[i].table, `print(${list[i].table})`) !== 'nil') {
        this.connections.push(list[i]);
      }
    }
  }
  transform(value: unknown, ...args: unknown[]): AssetOutput {
    return this.AssetOut;
  }

}
