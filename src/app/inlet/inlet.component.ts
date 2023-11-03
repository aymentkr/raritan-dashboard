import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {Inlet, Pole} from "../model/interfaces";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {NotificationService} from "../services/notification.service";
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit{
  dataSource = new MatTableDataSource<Inlet>();
  inlets: Inlet[] = [];
  polesColumns: string[] = ['name','voltage', 'current', 'act_power', 'app_power','act_energy','app_energy','editPole'];
  inletsColumns: string[] = ['select', 'frequency', 'poles', 'edit'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  editableRowIndexI: number = -1;
  editableRowIndexP: number = -1;
  hasPoles : boolean= true;
  isLoading: boolean = true;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private data: DataService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchInletData().then(() => {
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();

    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }


  async fetchInletData(){
    const fetchOutletDataRecursive = async (): Promise<void> => {
      const size = parseFloat(await this.data.getResult('#inlets', 'print(#inlets)'));
      if (isNaN(size)) {
        setTimeout(() => {
          fetchOutletDataRecursive();
        }, 0);
      } else {
        const test = parseFloat(await this.data.getResult(`inlets[1]:voltage(0)`,`print(inlets[1]:getVoltage(0))`));
        this.hasPoles = !isNaN(test);
        if (this.hasPoles) {
          for (let i = 1; i <= size; i++) {
            const frequency = parseFloat(await this.data.getResult(`inlets[${i}]:frequency`,`print(inlets[${i}]:getFrequency())`));
            await this.fetchPoleData(i)
              .then(async (data: Pole[]) => {
                  this.inlets.push({
                    id: i,
                    frequency: frequency,
                    poles: data,
                  });
                }
              )
          }
        } else {
          for (let i = 1; i <= size; i++) {
            const inletData: Inlet={
              id: i,
              frequency:  parseFloat(await this.data.getResult(`inlets[${i}]:frequency`, `print(inlets[${i}]:getFrequency())`)),
              poles : [{
                id : 0,
                name : 'L0',
                voltage: parseFloat(await this.data.getResult(`inlets[${i}]:voltage`, `print(inlets[${i}]:getVoltage())`)),
                current: parseFloat(await this.data.getResult(`inlets[${i}]:current`, `print(inlets[${i}]:getCurrent())`)),
                act_power: parseFloat(await this.data.getResult(`inlets[${i}]:act_power`, `print(inlets[${i}]:getActivePower())`)),
                app_power: parseFloat(await this.data.getResult(`inlets[${i}]:app_power`, `print(inlets[${i}]:getApparentPower())`)),
                act_energy: parseFloat(await this.data.getResult(`inlets[${i}]:act_energy`, `print(inlets[${i}]:getActiveEnergy())`)),
                app_energy: parseFloat(await this.data.getResult(`inlets[${i}]:app_energy`, `print(inlets[${i}]:getApparentEnergy())`)),
              }]
            }
            this.inlets.push(inletData);
          }
        }
        this.dataSource.data = [...this.inlets];
        this.isLoading = false;
      }
    }
    await fetchOutletDataRecursive();
  }

  async fetchPoleData(index:number): Promise<Pole[]> {
    const poles: Pole[] = [];
    const pole_numbers =['L1','L2','L3','L1-L3','L2-L3','L3-L1'];
    for (let i = 0; i < 6; i++) {
      poles.push({
        id: i,
        name: pole_numbers[i],
        voltage: parseFloat(await this.data.getResult(`inlets[${index}]:voltage(${i})`, `print(inlets[${index}]:getVoltage(${i}))`)),
        current: parseFloat(await this.data.getResult(`inlets[${index}]:current(${i})`, `print(inlets[${index}]:getCurrent(${i}))`)),
        act_power: parseFloat(await this.data.getResult(`inlets[${index}]:act_power(${i})`, `print(inlets[${index}]:getActivePower(${i}))`)),
        app_power: parseFloat(await this.data.getResult(`inlets[${index}]:app_power(${i})`, `print(inlets[${index}]:getApparentPower(${i}))`)),
        act_energy: parseFloat(await this.data.getResult(`inlets[${index}]:act_energy(${i})`, `print(inlets[${index}]:getActiveEnergy(${i}))`)),
        app_energy: parseFloat(await this.data.getResult(`inlets[${index}]:app_energy(${i})`, `print(inlets[${index}]:getApparentEnergy(${i}))`)),
      });
    }
    return poles;
  }


  editItemI( rowIndex: number) {
    this.editableRowIndexI = rowIndex;
  }
  editItemP( rowIndex: number) {
    this.editableRowIndexP = rowIndex;
  }

  saveInlet(rowData: Inlet) {
    this.editInlet(rowData)
      .then(() => {
        this.editableRowIndexI = -1;
        this.notificationService.openToastr(`Inlet data successfully saved: Inlet ${rowData.id} - Frequency value to ${rowData.frequency}`, 'Inlet Modification', 'done');
      })
      .catch(error => {
        this.showErrorSnackBar(error);
      });
  }

  savePole(inlet: Inlet, pole: Pole) {
    this.editPole(inlet, pole)
      .then(() => {
        this.editableRowIndexP = -1;
        this.notificationService.openToastr(`Pole data successfully saved: Inlet ${inlet.id} - Pole  ${pole.name}`, 'Pole Modification', 'done');
      })
      .catch(error => {
        this.showErrorSnackBar(error);
      });
  }

  async editInlet(inlet: Inlet): Promise<void> {
    if (inlet!=null) {
      this.data.sendToGo(`inlets[${inlet.id}]:setFrequency(${inlet.frequency});`);
    } else {
      throw new Error('inlet is null');
    }
  }


  async editPole(inlet: Inlet,pole: Pole): Promise<void> {
    if (pole!=null && inlet!=null) {
      if (this.hasPoles) {
        this.data.sendToGo(`inlets[${inlet.id}]:setVoltage(${pole.id},${pole.voltage});`);
        this.data.sendToGo((`inlets[${inlet.id}]:setCurrent(${pole.id},${pole.current});`));
        this.data.sendToGo((`inlets[${inlet.id}]:setActivePower(${pole.id},${pole.act_power});`));
        this.data.sendToGo((`inlets[${inlet.id}]:setApparentPower(${pole.id},${pole.app_power});`));
        this.data.sendToGo((`inlets[${inlet.id}]:addActiveEnergy(${pole.id},${pole.act_energy});`));
        this.data.sendToGo((`inlets[${inlet.id}]:addApparentEnergy(${pole.id},${pole.app_energy});`));
      } else {
        this.data.sendToGo((`inlets[${inlet.id}]:setVoltage(${pole.voltage});`));
        this.data.sendToGo((`inlets[${inlet.id}]:setCurrent(${pole.current});`));
        this.data.sendToGo((`inlets[${inlet.id}]:setActivePower(${pole.act_power});`));
        this.data.sendToGo((`inlets[${inlet.id}]:setApparentPower(${pole.app_power});`));
        this.data.sendToGo((`inlets[${inlet.id}]:addActiveEnergy(${pole.act_energy});`));
        this.data.sendToGo((`inlets[${inlet.id}]:addApparentEnergy(${pole.app_energy});`));
      }
    } else {
      throw new Error('pole is null');
    }
  }

  cancelEditInlet() {
    this.editableRowIndexI = -1;
  }
  cancelEditPole() {
    this.editableRowIndexP = -1;
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
