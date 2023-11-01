import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import {SelectionModel} from "@angular/cdk/collections";
import {DataService} from "../services/data.service";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Outlet} from "../model/interfaces";
import {MatPaginator} from "@angular/material/paginator";
import {NotificationService} from "../services/notification.service";


@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css'],
})
export class OutletComponent implements OnInit,AfterViewInit,OnDestroy {
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
              private data: DataService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef
  ) {
  }
  ngOnInit(): void {
    this.fetchOutletData()
      .then((data: Outlet[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.cdRef.detectChanges();
  }
  ngOnDestroy(): void {
    this.data.close();
  }

  async fetchOutletData(): Promise<Outlet[]> {
    try {
      const outlets: Outlet[] = [];
      await this.data.delay(1000);
      this.data.send('print(#outlets)');
      const fetchOutletDataRecursive = async (): Promise<void> => {
        const index = parseFloat(this.data.getList()[0]);
        if (isNaN(index)) {
          await this.data.delay(1000);
          return fetchOutletDataRecursive();
        } else {
          console.log(index);
          for (let i = 1; i <= 10; i++) {
            this.data.send(`print(outlets[${i}]:getState())`);
            this.data.send(`print(outlets[${i}]:getVoltage())`);
            this.data.send(`print(outlets[${i}]:getFrequency())`);
            this.data.send(`print(outlets[${i}]:getCurrent())`);
            this.data.send(`print(outlets[${i}]:getActivePower())`);
            this.data.send(`print(outlets[${i}]:getApparentPower())`);
          }
          await this.data.delay(1000);
          const messages = this.data.getList();
          console.log(messages);
          let i = 0, id = 1;
          while (i < messages.length) {
            const voltage = parseFloat(messages[i + 1]);
            const frequency = parseFloat(messages[i + 2]);
            const current = parseFloat(messages[i + 3]);
            const act_power = parseFloat(messages[i + 4]);
            const app_power = parseFloat(messages[i + 5]);
            outlets.push({
              id: id,
              state: messages[i] === 'true',
              voltage: voltage,
              frequency: frequency,
              current: current,
              act_power: act_power,
              app_power: app_power,
            });
            i += 6;
            id++;
            console.log(outlets)
          }
        }
      };

      await fetchOutletDataRecursive();
      return outlets;
    } catch (error) {
      // handle error appropriately
      console.error("Error occurred: ", error);
      throw error;
    }
  }




  editItem( rowIndex: number) {
    this.editableRowIndex = rowIndex;
  }

  saveItem(rowData: any) {
    this.editOutlet(rowData)
      .then(() => {
        this.editableRowIndex = -1;
        this.notificationService.openToastr(`Outlet  ${rowData.id} saved successfully`, 'Outlet Modification', 'done');
      })
      .catch(error => {
        this.notificationService.openToastr(`Failed to save data ${error}`,'Outlet Modification','error');
      });
  }

  async editOutlet(outlet: Outlet) {
    if (outlet!=null) {
      this.data.send(`outlets[${outlet.id}]:setVoltage(${outlet.voltage});`);
      this.data.send(`outlets[${outlet.id}]:setFrequency(${outlet.frequency});`);
      this.data.send(`outlets[${outlet.id}]:setCurrent(${outlet.current});`);
      this.data.send(`outlets[${outlet.id}]:setActivePower(${outlet.act_power});`);
      this.data.send(`outlets[${outlet.id}]:setApparentPower(${outlet.app_power});`);
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
  onPageSizeChange(event: any) {
    this.pageSize = event.pageSize;
  }


}
