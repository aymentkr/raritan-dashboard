import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {MatTable} from "@angular/material/table";
import {DeviceFlatNode, DeviceNode, Peripheral} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {NotificationService} from "../services/notification.service";
import {DataService} from "../services/data.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {DeleteDeviceDialogComponent} from "../peripheral/delete-device-dialog/delete-device-dialog.component";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FlatTreeControl} from "@angular/cdk/tree";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";

@Component({
  selector: 'app-sensorport',
  templateUrl: './sensorport.component.html',
  styleUrls: ['./sensorport.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SensorportComponent implements OnInit {
  isLoading: boolean = true;
  selectedDevice: DeviceFlatNode | null = null;
  innercolumns: string[] = ['peripheral_id', 'name', 'type'];
  displayedColumns : string[] = ['device_id', 'name', 'type', 'serial_number','actions'];

  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<Peripheral>>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  // Define treeControl, treeFlattener, and dataSource as class properties
  treeControl = new FlatTreeControl<DeviceFlatNode>(
    node => node.level,
    node => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    (node: DeviceNode, level: number) => this.sp._transformer(node, level, 'sensorports[1]'),
    node => node.level,
    node => node.expandable,
    node => node.tailports,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private dialog: MatDialog,
    private sp: SensorsPipe,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private data: DataService
  ) {}

  ngOnInit(): void {
    this.fetchSensorPortData().then(() => {
      this.cdRef.detectChanges();
      this.isLoading = false;
    }).catch((error) => {
      console.error('Data fetching failed:', error);
    });
  }


  async fetchSensorPortData() {
    const size = parseFloat(await this.data.getResult('#sensorports', 'print(#sensorports)'));
    if (size === 1) {
      const topology = await this.data.getResult('sensorports[1]:getTopology', 'print(sensorports[1]:getTopology())');
      this.dataSource.data = this.sp.convertToDevices(JSON.parse(topology));
      this.treeControl.expandAll();
    }
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
            this.addRowData(result.data).then(() => {
              this.cdRef.detectChanges();
            });
          }
        });
      }
    })
  }

  editDevice(obj: DeviceFlatNode, event: Event) {
    this.stopEventPropagation(event);
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  infoDevice(obj: DeviceFlatNode, event: Event): void {
    this.stopEventPropagation(event);
    this.sp.infoDevice(obj);
  };

  deleteDevice(device: DeviceFlatNode, event: Event) {
    this.stopEventPropagation(event);
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: `You want to remove the selected Device ${device.device_id}?` ,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap('sensorports[1]:getTopology');
        this.sp.removeDevice(device);
        this.fetchSensorPortData().then(() => {
          this.notificationService.openToastr(`Selected Device ${device.device_id}deleted successfully from Sensorports`, 'Deleting Devices', 'warning');
        });
      }
    });
  }

  async addRowData(type: string) {
    if (type) {
      this.sp.saveDevice('sensorports[1]', type);
      this.data.removeMap('sensorports[1]:getTopology');
      await this.fetchSensorPortData();
      this.notificationService.openToastr(`New Device with type ${type} saved successfully`, 'Adding Device to Sensorports', 'done');
    }
    else
      this.notificationService.openToastr('Failed to save data', 'Adding Device to Sensorports', 'error');
  }


  private editRowData(result: any) {
    this.sp.callMethod( result);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ', 'Device Modification ', 'done')
  }

  async isEmpty() {
    return await this.sp.getLength('sensorports') == 0;
  }

  removeAll() {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: 'you want to remove all devices?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap('sensorports[1]:getTopology');
        this.sp.removeAll('sensorports[1]');
        this.dataSource.data = [];
        this.notificationService.openToastr('All devices deleted successfully from Sensorports in Peripĥerals', 'Deleting Devices', 'warning');
      }
    });
  }
  toggleDeviceDetails(device: DeviceFlatNode, event: Event): void {
    this.stopEventPropagation(event);
    this.selectedDevice = this.selectedDevice === device ? null : device;
    this.cdRef.detectChanges();
  }

  stopEventPropagation(event: Event): void {
    event.stopPropagation();
  }

}
