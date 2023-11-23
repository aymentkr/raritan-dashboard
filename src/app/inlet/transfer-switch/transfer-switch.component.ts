import {Component, Input, OnInit} from '@angular/core';
import {Switch} from "../../model/interfaces";
import {DataService} from "../../services/data.service";
import {NotificationService} from "../../services/notification.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {BottomSheetInfoComponent} from "./bottom-sheet-info/bottom-sheet-info.component";
import {BottomSheetDetailsComponent} from "./bottom-sheet-details/bottom-sheet-details.component";

@Component({
  selector: 'app-transfer-switch',
  templateUrl: './transfer-switch.component.html',
  styleUrls: ['./transfer-switch.component.css']
})
export class TransferSwitchComponent implements OnInit{
  @Input() inputFromParent = 0 ;
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
    private notificationService: NotificationService,
    private bottomSheet: MatBottomSheet,
  ) {}

  ngOnInit(): void {
    this.fetchSwitchData();
  }

  async fetchSwitchData() {
    this.formData.preferredInlet = parseFloat(await this.data.getResult(`preferredInlet`, `print(switches[1]:getPreferredInlet())`));
    this.formData.BypassSelectedInlet = parseFloat(await this.data.getResult(`BypassSelectedInlet`, `print(switches[1]:getBypassSelectedInlet())`));
    this.formData.BypassActiveInlet = parseFloat(await this.data.getResult(`BypassActiveInlet`, `print(switches[1]:getBypassActiveInlet())`));
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
    return Array.from({ length: this.inputFromParent }, (_, index) => index + 1);
  }

  info() {
    this.bottomSheet.open(BottomSheetInfoComponent);
    /*
    Swal.fire({

      icon: 'info',
    });
*/
  }

  seeDetails() {
    this.bottomSheet.open(BottomSheetDetailsComponent);
    /*
    Swal.fire({
      title: 'Switches[1..1]:value ',
      html: `<mark> Prefered Inlet: </mark> <pre> ${this.formData.preferredInlet} </pre>`+
        `<mark> Bypass Selected Inlet: </mark> <pre> ${this.formData.BypassSelectedInlet} </pre>`+
        `<mark> Bypass Active Inlet: </mark> <pre> ${this.formData.BypassActiveInlet} </pre>`,
      icon: 'info'
    });*/
  }
}
