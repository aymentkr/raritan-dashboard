import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit{
  hasPoles : boolean= true;
  isLoading: boolean = true;
  sizeI = 0;sizeS=0;
  constructor(
    private data: DataService,
    private cdRef: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.fetchData().then(() => {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }
  async fetchData(){
    this.sizeI = parseFloat(await this.data.getResult('#inlets', 'print(#inlets)'));
    this.sizeS = parseFloat(await this.data.getResult('#switches', 'print(#switches)'));
    const test = parseFloat(await this.data.getResult(`inlets[1]:voltage(0)`,`print(inlets[1]:getVoltage(0))`));
    this.hasPoles = !isNaN(test);
  }

}
