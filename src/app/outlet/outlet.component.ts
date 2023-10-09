import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import {SelectionModel} from "@angular/cdk/collections";
import {DataService} from "../services/data.service";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import { MatSnackBar } from '@angular/material/snack-bar';
import {Outlet, Peripheral} from "../model/interfaces";


@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css'],
})
export class OutletComponent implements OnInit,AfterViewInit {
  dataSource = new MatTableDataSource<Outlet>();
  displayedColumns: string[] = [
    'select',
    'name',
    'state',
    'voltage',
    'frequency',
    'current',
    'act_power',
    'app_power',
    'edit',
  ];
  selection = new SelectionModel<any>(true, []);
  editableRowIndex: number = -1;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private _liveAnnouncer: LiveAnnouncer,
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
    this.dataService.fetchOutletData()
      .then((data: Outlet[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  saveItem(rowData: any) {
    this.dataService.editOutlet(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this._snackBar.open(`Outlet ${rowData.id} saved successfully`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      })
      .catch(error => {
        this._snackBar.open('Failed to save data', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      });
  }


  cancelEdit(rowIndex: number) {
    this.editableRowIndex = -1; // Exit edit mode
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
