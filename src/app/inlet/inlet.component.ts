import {ChangeDetectorRef, Component} from '@angular/core';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent{
  hasPoles : boolean= true;
  isLoading: boolean = true;
  size = 0;
  constructor(
    private data: DataService,
    private cdRef: ChangeDetectorRef
  ) {
    this.init().then(() => {
      this.cdRef.detectChanges();
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }
  async init(){
    this.size = parseFloat(await this.data.getResult('#inlets', 'print(#inlets)'));
    const test = parseFloat(await this.data.getResult(`inlets[1]:voltage(0)`,`print(inlets[1]:getVoltage(0))`));
    this.hasPoles = !isNaN(test);
    this.isLoading = false;
  }
}
