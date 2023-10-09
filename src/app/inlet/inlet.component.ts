import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {Inlet, Outlet} from "../model/interfaces";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {DataService} from "../services/data.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.css'],
})
export class InletComponent implements OnInit,AfterViewInit{

  dataSource = new MatTableDataSource<Inlet>();
  polesColumns: string[] = ['voltage', 'current', 'act_power', 'app_power','editPole'];
  inletsColumns: string[] = ['select', 'name', 'frequency', 'poles', 'edit'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  editableRowIndexI: number = -1;
  editableRowIndexP: number = -1;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private dataService: DataService,
    private _snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.fetchData();
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  fetchData() {
    this.dataService.fetchInletData()
      .then((data: Inlet) => {
        this.dataSource.data = [data];
        this.dataSource.sort = this.sort;
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

  saveInlet(rowData: any) {
    this.dataService.editInlet(rowData)
      .then(() => {
        this.editableRowIndexI = -1;
        this.showSuccessSnackBar();
      })
      .catch(error => {
        this.showErrorSnackBar();
      });
  }

  savePole(inlet: any,pole: any) {
    this.dataService.editPole(inlet,pole)
      .then(() => {
        this.editableRowIndexP = -1;
        this.showSuccessSnackBar();
      })
      .catch(error => {
        this.showErrorSnackBar();
      });
  }


  cancelEditInlet(rowIndex: number) {
    this.editableRowIndexI = -1;
  }
  cancelEditPole(rowIndex: number) {
    this.editableRowIndexP = -1;
  }

  showSuccessSnackBar() {
    this._snackBar.open('Data saved successfully', 'OK', {
      duration: 3000, // Adjust the duration as needed
      panelClass: ['success-snackbar'], // Optional: Add a custom CSS class for styling
    });
  }

  showErrorSnackBar() {
    this._snackBar.open('Failed to save data', 'OK', {
      duration: 3000, // Adjust the duration as needed
      panelClass: ['error-snackbar'], // Optional: Add a custom CSS class for styling
    });
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
