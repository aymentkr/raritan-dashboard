import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Ocp} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort, Sort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {DataService} from "../services/data.service";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-ocps',
  templateUrl: './ocps.component.html',
  styleUrls: ['./ocps.component.css']
})
export class OcpsComponent implements OnInit,AfterViewInit {
  dataSource = new MatTableDataSource<Ocp>();
  displayedColumns: string[] = [
    'select',
    'name',
    'status',
    'current',
    'peak_current',
    'edit',
  ];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  editableRowIndex: number = -1;
  isLoading: boolean = true;
  constructor(private _liveAnnouncer: LiveAnnouncer,
              private dataService: DataService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
  }


  fetchData() {
    this.dataService.fetchOcpData()
      .then((data: Ocp[]) => {
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
    this.dataService.editOcp(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`OCP  ${rowData.id} saved successfully`, 'OCP Modification', 'done');
      })
      .catch(error => {
        this.notificationService.openToastr(`Failed to save data ${error}`,'OCP Modification','error');
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

}
