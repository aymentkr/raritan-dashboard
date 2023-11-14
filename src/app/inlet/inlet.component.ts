import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";
import Swal from "sweetalert2";
import {Switch} from "../model/interfaces";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit{
  hasPoles : boolean= true;
  isLoading: boolean = true;
  size = 0;
  formData: Switch  ={
    preferredInlet: 0,
    BypassSelectedInlet: 0,
    BypassActiveInlet: 0,
    FaultFlags: 0,
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
      this.formData.preferredInlet = parseFloat(await this.data.getResult(`preferredInlet`, `print(switches[1]:getPreferredInlet())`));
      this.formData.BypassSelectedInlet = parseFloat(await this.data.getResult(`BypassSelectedInlet`, `print(switches[1]:getBypassSelectedInlet())`));
      this.formData.BypassActiveInlet = parseFloat(await this.data.getResult(`BypassActiveInlet`, `print(switches[1]:getBypassActiveInlet())`));
    }
  }
  submitForm(formData: Switch) {
    console.log(formData);
    if (formData.hasOwnProperty('FaultFlags')) {
      this.data.sendToGo(`switches[1]:setFaultFlags(${formData.FaultFlags})`);
    }

    if (formData.hasOwnProperty('Inlet1FaultFlags')) {
      this.data.sendToGo(`switches[1]:setInlet1FaultFlags(${formData.Inlet1FaultFlags})`);
    }

    if (formData.hasOwnProperty('Inlet2FaultFlags')) {
      this.data.sendToGo(`switches[1]:setInlet2FaultFlags(${formData.Inlet2FaultFlags})`);
    }

    if (formData.hasOwnProperty('InletPhaseAngle')) {
      this.data.sendToGo(`switches[1]:setInletPhaseAngle(${formData.InletPhaseAngle})`);
    }

    if (formData.hasOwnProperty('preferredInlet')) {
      this.data.sendToGo(`switches[1]:setPreferredInlet(${formData.preferredInlet})`);
    }

    // success message add all the valeus that will be changed , you can use a list ;)
  }
  generateInletRange(): number[] {
    return Array.from({ length: this.size }, (_, index) => index + 1);
  }

  info() {
    Swal.fire({
      title: 'switches[1..1]:methods',
      html: '<ul>' +
        '  <li><mark>Sets fault flags</mark>  <pre> (1=phase, 2=overload) </pre> </li>' +
        '  <li><mark>Sets Inlet 1 fault flags </mark> </li>' +
        '  <li><mark>Sets Inlet 2 fault flags </mark>  <pre>(1=SMPS, 2=MOV, 4=short, 8=open) </pre> </li>' +
        '  <li><mark>Sets Inlet phase angle</mark>   <pre>to 15 f.e </pre> </li>' +
        `  <li><mark>Sets preferred Inlet </mark>  <pre> [1 .. ${this.size}] </pre> </li>` +
        '  <li><mark>Sets power fail detect time</mark> </li>' +
        '  <li><mark>Sets relay open time</mark></li>' +
        '  <li><mark>Sets total transfer time</mark> <pre>  (microseconds) </pre> </li>' +
        `  <li><mark>Sets bypass selected Inlet </mark>   <pre>[0=none, 1 .. ${this.size}] </pre> </li>` +
        '</ul>',
      icon: 'info',
    });

  }

  seeDetails() {
    Swal.fire({
      title: 'Switches[1..1]:value ',
      html: `<mark> Preffered Inlet: </mark> <pre> ${this.formData.preferredInlet} </pre>`+
            `<mark> Bypass Selected Inlet: </mark> <pre> ${this.formData.BypassSelectedInlet} </pre>`+
            `<mark> Bypass Active Inlet: </mark> <pre> ${this.formData.BypassActiveInlet} </pre>`,
      icon: 'info'
    });
  }
}
