import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {AddPeripheralDeviceComponent} from "./add-peripheral-device/add-peripheral-device.component";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Peripheral} from "../model/interfaces";
import {SensorService} from "../services/sensor.service";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "./edit-peripheral-device/edit-peripheral-device.component";
import Swal from 'sweetalert2';
import {NotificationService} from "../services/notification.service";


@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
})
export class PeripheralComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<Peripheral>();
  columns : string[] = ['id', 'name', 'type', 'serial_number'];
  displayedColumns: string[] = ['select', ...this.columns, 'actions'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private dialog: MatDialog,
    private ss: SensorService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  fetchData() {
    this.dataService.fetchPeripheralData()
      .then((data: Peripheral[]) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  addDevice() {
    const dialogRef = this.dialog.open(AddPeripheralDeviceComponent, {
      data: this.dataSource.data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.addRowData(result.data);
    });
  }

  editDevice(obj: Peripheral) {
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  async addRowData(type:string) {
    if (type != "") {
      await this.ss.saveDevice('sensorports[1]',type)
      this.fetchData();
      this.notificationService.openToastr(`New Device with type ${type} saved successfully`, 'Adding Device to Sensorports','done');
    } else {
      this.notificationService.openToastr('Failed to save data','Adding Device to Sensorports','error');
    }
  }

  private editRowData(data: any) {
    this.ss.callMethod('sensorports[1]',data);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ','Device Modification ','done')
  }

  public infoDevice = (obj: Peripheral): void => {
    this.ss.infoDevice(obj);
  };

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

  deleteSelectedItems() {
    const selectedItems = this.selection.selected;
    let title,text: string;

    if (this.isAllSelected()) {
      title = 'Are you sure?';
      text = 'you want to remove all devices?';
    } else {
      title = 'Are you sure?';
      text = 'You want to remove the selected device(s)?';
    }

    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.isAllSelected()) {
          this.ss.removeAll();
        } else {
          selectedItems.forEach(item => {
            this.ss.removeDevice('sensorports[1]', item);
          });
        }
        this.selection.clear();
        this.fetchData();
        if (this.isAllSelected()) {
          Swal.fire(
            'Deleted!',
            'All devices deleted successfully',
            'success'
          )
          this.notificationService.openToastr('All devices deleted successfully from Sensorports in Peripĥerals', 'Deleting Devices', 'warning');
        } else {
          Swal.fire(
            'Deleted!',
            'Selected device(s) deleted successfully',
            'success'
          )
          this.notificationService.openToastr('Selected device(s) deleted successfully from Sensorports in Peripĥerals', 'Deleting Devices', 'warning');
        }
      }
    });
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
}