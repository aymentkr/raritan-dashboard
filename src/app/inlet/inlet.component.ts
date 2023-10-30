import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {Inlet, Pole} from "../model/interfaces";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {NotificationService} from "../services/notification.service";
import {InletsPipe} from "../pipes/inlets.pipe";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit,AfterViewInit{

  dataSource = new MatTableDataSource<Inlet>();
  polesColumns: string[] = ['name','voltage', 'current', 'act_power', 'app_power','act_energy','app_energy','editPole'];
  inletsColumns: string[] = ['select', 'frequency', 'poles', 'edit'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  editableRowIndexI: number = -1;
  editableRowIndexP: number = -1;
  hasPoles ?: boolean;
  isLoading: boolean = true;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private inletsPipe: InletsPipe,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.fetchData();
    this.hasPoles = this.inletsPipe.isInlet_P();
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  fetchData() {
    this.inletsPipe.transform()
      .then((data: Inlet[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }
  editInlet( rowIndex: number) {
    this.editableRowIndexI = rowIndex;
  }
  editPole( rowIndex: number) {
    this.editableRowIndexP = rowIndex;
  }

  saveInlet(rowData: Inlet) {
    this.inletsPipe.editInlet(rowData)
      .then(() => {
        this.editableRowIndexI = -1;
        this.notificationService.openToastr(`Inlet data successfully saved: Inlet ${rowData.id} - Frequency value to ${rowData.frequency}`, 'Inlet Modification', 'done');
      })
      .catch(error => {
        this.showErrorSnackBar(error);
      });
  }

  savePole(inlet: Inlet, pole: Pole) {
    if (this.hasPoles)
    this.inletsPipe.editPole(inlet, pole, this.hasPoles)
      .then(() => {
        this.editableRowIndexP = -1;
        this.notificationService.openToastr(`Pole data successfully saved: Inlet ${inlet.id} - Pole  ${pole.name}`, 'Pole Modification', 'done');
      })
      .catch(error => {
        this.showErrorSnackBar(error);
      });
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
