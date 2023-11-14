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
  size = 0;
  formData = {
    id : 0,
    preferredInlet: 0,
    BypassSelectedInlet: 0,
    BypassActiveInlet: 0,
    FaultFlags:0,
    Inlet1FaultFlags: 0,
    Inlet2FaultFlags: 0,
    InletPhaseAngle: 0,
    PowerFailDetectTime: 0,
    RelayOpenTime: 0,
    TotalTransferTime: 0,
  };
  constructor(
    private data: DataService,
    private cdRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.fetchData().then(() => {
      this.cdRef.detectChanges();
      this.isLoading = false;
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }

  async fetchData(){
    this.size = parseFloat(await this.data.getResult('#inlets', 'print(#inlets)'));
    const test = parseFloat(await this.data.getResult(`inlets[1]:voltage(0)`,`print(inlets[1]:getVoltage(0))`));
    this.hasPoles = !isNaN(test);
    await this.fetchSwitchData();
  }

  async fetchSwitchData() {
    const size = parseFloat(await this.data.getResult('#switches', 'print(#switches)'));
    if (size ===1){
      this.formData.id = 1;
      this.formData.preferredInlet = parseFloat(await this.data.getResult(`preferredInlet`, `print(switches[1]:getPreferredInlet())`));
      this.formData.BypassSelectedInlet = parseFloat(await this.data.getResult(`BypassSelectedInlet`, `print(switches[1]:getBypassSelectedInlet())`));
      this.formData.BypassActiveInlet = parseFloat(await this.data.getResult(`BypassActiveInlet`, `print(switches[1]:getBypassActiveInlet())`));
    }
  }


  submitForm(formData: any) {
    console.log(formData)
  }

  generateInletRange(): number[] {
    return Array.from({ length: this.size }, (_, index) => index + 1);
  }

}
