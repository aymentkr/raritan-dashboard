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
  ocps: Ocp[] = [];
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
  index : number = -1;
  editableRowIndex: number = -1;
  isLoading: boolean = true;
  constructor(private _liveAnnouncer: LiveAnnouncer,
              private data: DataService,
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
    this.fetchOcpData()
      .then(() => {
        this.dataSource.sort = this.sort;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchOcpData() {
    const fetchOcpDataRecursive = async (): Promise<void> => {
      this.index = parseFloat(await this.data.getResult('#ocps', 'print(#ocps)'));
      if (isNaN(this.index)) {
        setTimeout(() => {
          fetchOcpDataRecursive();
        }, 0);
      } else {
        for (let i = 1; i <= this.index; i++) {
          const ocpData = {
            id: i,
            status: (await this.data.getResult(`ocps[${i}]:status`, `print(ocps[${i}]:isClosed())`)).includes('true'),
            current: parseFloat(await this.data.getResult(`ocps[${i}]:current`, `print(ocps[${i}]:getCurrent())`)),
            peak_current: parseFloat(await this.data.getResult(`ocps[${i}]:peak_current`, `print(ocps[${i}]:getPeakCurrent())`)),
          };
          this.ocps.push(ocpData);
          this.dataSource.data = [...this.ocps];
        }
        this.isLoading = false;
      }
    }
    await fetchOcpDataRecursive();
  }

  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  saveItem(rowData: any) {
    this.editOcp(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`OCP  ${rowData.id} saved successfully`, 'OCP Modification', 'done');
      })
      .catch(error => {
        this.notificationService.openToastr(`Failed to save data ${error}`,'OCP Modification','error');
      });
  }

  async editOcp(ocp: Ocp) {
    if (ocp != null) {
      this.data.sendToGo(`ocps[${ocp.id}]:setCurrent(${ocp.current});`);
      this.data.sendToGo(`ocps[${ocp.id}]:setPeakCurrent(${ocp.peak_current});`);
    } else {
      throw new Error('outlet is null');
    }
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
