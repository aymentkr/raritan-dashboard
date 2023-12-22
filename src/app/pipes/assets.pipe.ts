import {Pipe, PipeTransform} from '@angular/core';
import {Asset, SlideToggle} from "../model/interfaces";
import {DataService} from "../services/data.service";

interface LEDState {
  r:number,
  g:number,
  b:number,
  on:boolean,
  slow:boolean,
  fast:boolean
}

@Pipe({
  name: 'LEDState'
})
export class AssetsPipe implements PipeTransform {
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
  constructor(private data: DataService) {}


  async transform(value: number, ...args: unknown[]): Promise<LEDState> {
    this.data.sendToGo(`r, g, b, on, slow, fast = assetstrips[1]:getLEDState(${value})`);
    return {
      r: parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${value}):r`, 'print(r)')),
      g: parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${value}):g`, 'print(g)')),
      b: parseFloat(await this.data.getResult(`assetstrips[1]:getLEDState(${value}):b`, 'print(b)')),
      on: await this.data.getResult(`assetstrips[1]:getLEDState(${value}):on`, 'print(on)') === 'true',
      fast: await this.data.getResult(`assetstrips[1]:getLEDState(${value}):fast`, 'print(fast)') === 'true',
      slow: await this.data.getResult(`assetstrips[1]:getLEDState(${value}):slow`, 'print(slow)') === 'true',
    }
  }

  async init() {
    for (let i = this.connections.length - 1; i >= 0; i--) {
      if (await this.data.getResult(this.connections[i].table, `print(${this.connections[i].table})`) === 'nil') {
        this.connections.splice(i, 1);
      }
    }
  }

  convertToAssetId(custom:boolean,msb: number, lsb: number): string {
    const assetId: string = `${msb.toString(16).padStart(2, '0')}${lsb.toString(16).padStart(2, '0')}`.toUpperCase();
    return custom ? `CUSTOMID${assetId}  (programmable)` : 'DEADBEEF' + assetId;
  }

  isDuplicate(data: Asset[], value: number): boolean {
    const checkDuplicates = (asset: Asset): boolean => {
      return <boolean>(asset.ID1 === value || asset.ID2 === value || (asset.Extensions && this.isDuplicate(asset.Extensions, value)));
    };

    return data.some(checkDuplicates);
  }

  removeLEDFromMap(value:number){
    this.data.removeMap(`r, g, b, on, slow, fast = assetstrips[1]:getLEDState(${value})`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):r`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):g`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):b`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):on`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):fast`);
    this.data.removeMap(`assetstrips[1]:getLEDState(${value}):slow`);
  }

}
