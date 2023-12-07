import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit{
  isLoading: boolean = true;
  hasPoles : boolean= true;
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
    this.hasPoles = this.sizeS === 0;
  }
}
