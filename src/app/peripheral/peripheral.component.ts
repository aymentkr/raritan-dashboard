import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {AddPeripheralDeviceComponent} from "./add-peripheral-device/add-peripheral-device.component";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {InnerPeripheral, Peripheral} from "../model/interfaces";
import {DataService} from "../services/data.service";
import {EditPeripheralDeviceComponent} from "./edit-peripheral-device/edit-peripheral-device.component";
import Swal from 'sweetalert2';
import {NotificationService} from "../services/notification.service";
import {SensorsPipe} from "../pipes/sensors.pipe";


@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
})
export class PeripheralComponent implements OnInit {
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<Peripheral>();
  columns : string[] = ['id', 'name', 'type', 'serial_number'];
  innerDisplayedColumns: string[] = ['id', 'name', 'methodName'];
  displayedColumns: string[] = ['select', ...this.columns, 'actions'];
  expandedElement!: null | Peripheral;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<InnerPeripheral>>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;

  constructor(
    private dialog: MatDialog,
    private sp: SensorsPipe,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private data: DataService,
  ) {}

  ngOnInit(): void {
    this.fetchPeripheralData().then((data) => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
      this.isLoading = false;
    })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  async fetchPeripheralData() {
    const size = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    if (size === 1) {
      const lines = (await this.data.getResult('sensorports[1]:listDevices', 'print(sensorports[1]:listDevices())')).split('\n');
      return this.sp.convertLinesToPeripherals(lines);
    } else return []
  }

  addDevice() {
    this.isEmpty().then(_bool => {
      if (_bool)
        this.notificationService.openToastr("Sorry! You can't add any virtual peripheral device in QEMU currently :(",'Adding Device to Sensorports','info');
      else {
        const dialogRef = this.dialog.open(AddPeripheralDeviceComponent, {
          data: this.dataSource.data
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.addRowData(result.data);
        });
      }
    })
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
    if (type != '') {
      this.selection.clear();
      this.sp.saveDevice('sensorports[1]',type)
      this.data.removeMap(`sensorports[1]:listDevices`);
      this.dataSource.data = await this.fetchPeripheralData();
      this.notificationService.openToastr(`New Device with type ${type} saved successfully`, 'Adding Device to Sensorports','done');
    } else {
      this.notificationService.openToastr('Failed to save data','Adding Device to Sensorports','error');
    }
  }

  private editRowData(data: any) {
    this.sp.callMethod('sensorports[1]',data);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ','Device Modification ','done')
  }

  public infoDevice = (obj: Peripheral): void => {
    this.sp.infoDevice(obj);
  };



  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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
        this.data.removeMap(`sensorports[1]:listDevices`);
        if (this.isAllSelected()) {
          this.sp.removeAll('sensorports[1]');
          this.dataSource.data = [];
          this.dataSource._updateChangeSubscription();
        } else {
          selectedItems.forEach(item => {
            const index = this.dataSource.data.indexOf(item);
            if (index !== -1) {
              this.sp.removeDevice('sensorports[1]', item);
              this.dataSource.data.splice(index, 1);
              this.dataSource._updateChangeSubscription();
            }
          });
        }
        this.selection.clear();
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

  async isEmpty() {
    return  await this.sp.getLength('sensorports') == 0;
  }

  toggleRow(element: Peripheral) {
    element.methods && (element.methods as unknown as MatTableDataSource<InnerPeripheral>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    this.cdRef.detectChanges();
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<InnerPeripheral>).sort = this.innerSort.toArray()[index]);
  }
}
