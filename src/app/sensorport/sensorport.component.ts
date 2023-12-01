import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import { DeviceFlatNode, DeviceNode, Peripheral} from "../model/interfaces";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { SensorsPipe } from "../pipes/sensors.pipe";
import { NotificationService } from "../services/notification.service";
import { DataService } from "../services/data.service";
import { AddPeripheralDeviceComponent } from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import { EditPeripheralDeviceComponent } from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import { DeleteDeviceDialogComponent } from "../peripheral/delete-device-dialog/delete-device-dialog.component";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";

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
  ]
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
    this.sp._transformer,
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
      this.dataSource.data = this.convertToDevices(JSON.parse(topology));
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
            this.addRowData(result.data);
          }
        });
      }
    })
  }

  editDevice(obj: DeviceFlatNode) {
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  async addRowData(type: string) {
    if (type) {
      const lastDevice = this.dataSource.data[this.dataSource.data.length-1]
      if (lastDevice && !lastDevice.type.includes('DPX_') && !type.includes('DPX_'))
        this.sp.connectDevice(lastDevice, 'sensorports[1]', type);
      else
        this.sp.saveDevice('sensorports[1]', type);

      this.data.removeMap('sensorports[1]:getTopology');
      await this.fetchSensorPortData();
      this.notificationService.openToastr(`New Device with type ${type} saved successfully`, 'Adding Device to Sensorports', 'done');
    }
    else
      this.notificationService.openToastr('Failed to save data', 'Adding Device to Sensorports', 'error');
  }


  private editRowData(result: any) {
    this.sp.callMethod('sensorports[1]', result);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ', 'Device Modification ', 'done')
  }

  public infoDevice = (obj: DeviceFlatNode): void => {
    this.sp.infoDevice(obj);
  };

  async isEmpty() {
    return await this.sp.getLength('sensorports') == 0;
  }

  private convertToDevices(data: any): DeviceNode[] {
    if (Array.isArray(data)) {
      return data.flatMap(item => this.convertToDevices(item));
    } else {
      const { type, serial, tailports } = data;
      return [{
        type,
        serial,
        tailports: tailports ? this.convertToDevices(tailports) : undefined
      }];
    }
  }
  toggleDeviceDetails(device: DeviceFlatNode): void {
    this.selectedDevice = this.selectedDevice === device ? null : device;
    this.cdRef.detectChanges();
  }

  deleteDevice(device: DeviceFlatNode) {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: `You want to remove the selected Device ${device.device_id}?` ,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap('sensorports[1]:getTopology');
        this.sp.removeDevice('sensorports[1]', device);
        this.fetchSensorPortData().then(r => {
          this.notificationService.openToastr(`Selected Device ${device.device_id}deleted successfully from Sensorports`, 'Deleting Devices', 'warning');
        });
      }
    });
  }

  removeAll() {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: 'you want to remove all devices?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap(`sensorports[1]:listDevices`);
        this.sp.removeAll('sensorports[1]');
        this.dataSource.data = [];
        this.notificationService.openToastr('All devices deleted successfully from Sensorports in Peripĥerals', 'Deleting Devices', 'warning');
      }
    });
  }
}
