import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import {SelectionModel} from "@angular/cdk/collections";
import {DataService} from "../services/data.service";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Outlet} from "../model/interfaces";
import {MatPaginator} from "@angular/material/paginator";
import {NotificationService} from "../services/notification.service";
import {OutletsPipe} from "../pipes/outlets.pipe";


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
  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;
  pageSizeOptions: number[] = [5,10, 15,20, 30,35,40];
  pageSize: number = 10;
  editableRowIndex: number = -1;
  isLoading: boolean = true;
  constructor(private _liveAnnouncer: LiveAnnouncer,
              private outletsPipe: OutletsPipe,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.fetchData();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.cdRef.detectChanges();
  }

  fetchData() {
    this.outletsPipe.transform()
      .then((data: Outlet[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  saveItem(rowData: any) {
    this.outletsPipe.editOutlet(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`Outlet  ${rowData.id} saved successfully`, 'Outlet Modification', 'done');
      })
      .catch(error => {
        this.notificationService.openToastr(`Failed to save data ${error}`,'Outlet Modification','error');
      });
  }


  cancelEdit() {
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
  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
  }

}
