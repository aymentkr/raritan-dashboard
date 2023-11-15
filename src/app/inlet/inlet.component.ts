import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../services/data.service";
import Swal from "sweetalert2";
import {Switch} from "../model/interfaces";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit{
  hasPoles : boolean= true;
  isLoading: boolean = true;
  sizeI = 0;sizeS=0;
  formData: Switch = {
    preferredInlet: null,
    BypassSelectedInlet: null,
    BypassActiveInlet: null,
    FaultFlags: null,
    Inlet1FaultFlags: null,
    Inlet2FaultFlags: null,
    InletPhaseAngle: null,
    PowerFailDetectTime: null,
    RelayOpenTime: null,
    TotalTransferTime: null,
  };
  constructor(
    private data: DataService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
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
    this.sizeI = parseFloat(await this.data.getResult('#inlets', 'print(#inlets)'));
    const test = parseFloat(await this.data.getResult(`inlets[1]:voltage(0)`,`print(inlets[1]:getVoltage(0))`));
    this.hasPoles = !isNaN(test);
    await this.fetchSwitchData();
  }
  async fetchSwitchData() {
    this.sizeS = parseFloat(await this.data.getResult('#switches', 'print(#switches)'));
    if (this.sizeS ===1){
      this.formData.preferredInlet = parseFloat(await this.data.getResult(`preferredInlet`, `print(switches[1]:getPreferredInlet())`));
      this.formData.BypassSelectedInlet = parseFloat(await this.data.getResult(`BypassSelectedInlet`, `print(switches[1]:getBypassSelectedInlet())`));
      this.formData.BypassActiveInlet = parseFloat(await this.data.getResult(`BypassActiveInlet`, `print(switches[1]:getBypassActiveInlet())`));
    }
  }
  submitForm(formData: Switch) {
    const propertyMap: Record<string, (value: any) => void> = {
      FaultFlags: value => this.data.sendToGo(`switches[1]:setFaultFlags(${value})`),
      Inlet1FaultFlags: value => this.data.sendToGo(`switches[1]:setInlet1FaultFlags(${value})`),
      Inlet2FaultFlags: value => this.data.sendToGo(`switches[1]:setInlet2FaultFlags(${value})`),
      InletPhaseAngle: value => this.data.sendToGo(`switches[1]:setInletPhaseAngle(${value})`),
      preferredInlet: value => this.data.sendToGo(`switches[1]:setPreferredInlet(${value})`),
      BypassActiveInlet: value => this.data.sendToGo(`switches[1]:setBypassActiveInlet(${value})`),
      BypassSelectedInlet: value => this.data.sendToGo(`switches[1]:setBypassSelectedInlet(${value})`),
      PowerFailDetectTime: value => this.data.sendToGo(`switches[1]:setPowerFailDetectTime(${value})`),
      RelayOpenTime: value => this.data.sendToGo(`switches[1]:setRelayOpenTime(${value})`),
      TotalTransferTime: value => this.data.sendToGo(`switches[1]:setTotalTransferTime(${value})`),
    };

    const list: string[] = [];

    for (const [property, value] of Object.entries(formData)) {
      if (value !== null && propertyMap[property]) {
        propertyMap[property](value);
        list.push(property);
      }
    }
    if (list.length>0)
    this.notificationService.openToastr(`Successfully updated: ${list.join(', ')}`, 'Switches Modification ', 'done')
  }


  generateInletRange(): number[] {
    return Array.from({ length: this.sizeI }, (_, index) => index + 1);
  }

  info() {
    Swal.fire({
      title: 'switches[1..1]:methods',
      html: '<ul>' +
        '  <li><mark>Sets fault flags</mark>  <pre> (1=phase, 2=overload) </pre> </li>' +
        '  <li><mark>Sets Inlet 1 fault flags </mark> </li>' +
        '  <li><mark>Sets Inlet 2 fault flags </mark>  <pre>(1=SMPS, 2=MOV, 4=short, 8=open) </pre> </li>' +
        '  <li><mark>Sets Inlet phase angle</mark>   <pre>to 15 f.e </pre> </li>' +
        `  <li><mark>Sets preferred Inlet </mark>  <pre> [1 .. ${this.sizeI}] </pre> </li>` +
        '  <li><mark>Sets power fail detect time</mark> </li>' +
        '  <li><mark>Sets relay open time</mark></li>' +
        '  <li><mark>Sets total transfer time</mark> <pre>  (microseconds) </pre> </li>' +
        `  <li><mark>Sets bypass selected Inlet </mark>   <pre>[0=none, 1 .. ${this.sizeI}] </pre> </li>` +
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
