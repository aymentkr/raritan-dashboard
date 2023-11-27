import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {Device, Peripheral} from "../model/interfaces";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {NotificationService} from "../services/notification.service";
import {DataService} from "../services/data.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {DeleteDeviceDialogComponent} from "../peripheral/delete-device-dialog/delete-device-dialog.component";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-sensorport',
  templateUrl: './sensorport.component.html',
  styleUrls: ['./sensorport.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SensorportComponent implements OnInit{
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<Device>();

  columns: string[] = ['device_id', 'name', 'type', 'serial_number'];
  innercolumns: string[] = ['peripheral_id', 'name', 'type'];

  displayedColumns: string[] = ['select', ...this.columns, 'actions'];
  expandedElement!: Device;
  selection = new SelectionModel<any>(true, []);
  @ViewChild('outerSort', {static: true}) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<Peripheral>>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;

  constructor(
    private dialog: MatDialog,
    private sp: SensorsPipe,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private data: DataService,
  ) {
  }

  ngOnInit(): void {
    this.fetchSensorPortData().then((data) => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
      this.isLoading = false;
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }

  async fetchSensorPortData() {
    const size = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    if (size === 1) {
      const lines = (await this.data.getResult('sensorports[1]:listDevices', 'print(sensorports[1]:listDevices())')).split('\n');
      return this.sp.convertLinesToDevices(lines);
    } else return []
  }

  addDevice() {
    this.isEmpty().then(_bool => {
      if (_bool)
        this.notificationService.openToastr("Sorry! You can't add any virtual peripheral device in QEMU currently :(", 'Adding Device to Sensorports', 'info');
      else {
        const dialogRef = this.dialog.open(AddPeripheralDeviceComponent, {
          data: this.dataSource.data
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.addRowData(result.data);
          }
        });
      }
    })
  }

  editDevice(obj: Device) {
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  async addRowData(type: string) {
    if (type != '') {
      this.selection.clear();
      this.sp.saveDevice(this.dataSource.data,'sensorports[1]', type)
      this.data.removeMap(`sensorports[1]:listDevices`);
      this.dataSource.data = await this.fetchSensorPortData();
      this.notificationService.openToastr(`New Device with type ${type} saved successfully`, 'Adding Device to Sensorports', 'done');
    } else {
      this.notificationService.openToastr('Failed to save data', 'Adding Device to Sensorports', 'error');
    }
  }

  private editRowData(data: any) {
    this.sp.callMethod('sensorports[1]', data);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ', 'Device Modification ', 'done')
  }

  public infoDevice = (obj: Device): void => {
    this.sp.infoDevice(obj);
  };

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  deleteSelectedItems() {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: {
        isAllSelected: this.isAllSelected(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap(`sensorports[1]:listDevices`);
        if (this.isAllSelected()) {
          this.sp.removeAll('sensorports[1]');
          this.dataSource.data = [];
          this.dataSource._updateChangeSubscription();
        } else {
          const selectedItems = this.selection.selected;
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
          this.notificationService.openToastr('All devices deleted successfully from Sensorports in Peripĥerals', 'Deleting Devices', 'warning');
        } else {
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
    return await this.sp.getLength('sensorports') == 0;
  }

  toggleRow(element: Device) {
    this.expandedElement = element;
    this.cdRef.detectChanges();
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<Peripheral>).sort = this.innerSort.toArray()[index]);
  }

}
