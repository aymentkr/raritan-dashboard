import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Inlet} from "../../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {DataService} from "../../services/data.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-inlet-table',
  templateUrl: './inlet-table.component.html',
  styleUrls: ['./inlet-table.component.css']
})
export class InletTableComponent implements OnInit{
  @Input() inputFromParent = 0 ;
  dataSource = new MatTableDataSource<Inlet>();
  Columns: string[] = ['select', 'name','frequency', 'voltage', 'current', 'act_power', 'app_power','act_energy','app_energy', 'edit'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  editableRowIndex: number = -1;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private data: DataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchInletData().then((data) => {
      this.dataSource.data = data
      this.dataSource.sort = this.sort;
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }

  async fetchInletData(){
    const inlets: Inlet[] = [];
    for (let i = 1; i <= this.inputFromParent; i++) {
      const inletData: Inlet={
        id: i,
        frequency:  parseFloat(await this.data.getResult(`inlets[${i}]:frequency`, `print(inlets[${i}]:getFrequency())`)),
        voltage: parseFloat(await this.data.getResult(`inlets[${i}]:voltage`, `print(inlets[${i}]:getVoltage())`)),
        current: parseFloat(await this.data.getResult(`inlets[${i}]:current`, `print(inlets[${i}]:getCurrent())`)),
        act_power: parseFloat(await this.data.getResult(`inlets[${i}]:act_power`, `print(inlets[${i}]:getActivePower())`)),
        app_power: parseFloat(await this.data.getResult(`inlets[${i}]:app_power`, `print(inlets[${i}]:getApparentPower())`)),
        act_energy: parseFloat(await this.data.getResult(`inlets[${i}]:act_energy`, `print(inlets[${i}]:getActiveEnergy())`)),
        app_energy: parseFloat(await this.data.getResult(`inlets[${i}]:app_energy`, `print(inlets[${i}]:getApparentEnergy())`)),
      }
      inlets.push(inletData);
    }
  return inlets;
  }
  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  save(rowData: Inlet) {
    this.editInlet(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`Inlet data successfully saved: Inlet ${rowData.id} - Frequency value to ${rowData.frequency}`, 'Inlet Modification', 'done');
      })
      .catch(error => {
        this.showErrorSnackBar(error);
      });
  }

  async editInlet(inlet: Inlet): Promise<void> {
    if (inlet!=null) {
      const {
        id,
        frequency,
        voltage,
        current,
        act_power,
        app_power,
        act_energy,
        app_energy
      } = inlet;
      this.data.send('',`
        inlets[${id}]:setFrequency(${frequency})
        inlets[${id}]:setVoltage(${voltage});
        inlets[${id}]:setCurrent(${current});
        inlets[${id}]:setActivePower(${act_power});
        inlets[${id}]:setApparentPower(${app_power});
        inlets[${id}]:setActiveEnergy(${act_energy});
        inlets[${id}]:setApparentEnergy(${app_energy});
        `);
      Object.entries(inlet).forEach(([key, value]) => this.data.editMap(`inlets[${inlet.id}]:${key}`, value as number | boolean));
    } else {
      throw new Error('inlet is null');
    }
  }

  cancelEdit() {
    this.editableRowIndex = -1;
  }

  showErrorSnackBar(error:string) {
    this.notificationService.openToastr(`Failed to save data ${error}`,'Inlet Modification','error');
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}

