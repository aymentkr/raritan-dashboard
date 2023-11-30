// sensorport.component.ts

import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTable, MatTableDataSource } from "@angular/material/table";
import {DeviceNode, FlatNode, Peripheral} from "../model/interfaces";
import { SelectionModel } from "@angular/cdk/collections";
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

  private _transformer = (node: DeviceNode, level: number) => {
    return {
      expandable: !!node.tailports && node.tailports.length > 0,
      type: node.type,
      serial_number: node.serial,
      level: level,
    };
  };

  isLoading: boolean = true;
  columns: string[] = ['device_id', 'name', 'type', 'serial_number'];
  selection = new SelectionModel<any>(true, []);
  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<Peripheral>>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;

  // Initialize treeControl, treeFlattener, and dataSource
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
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
    this.fetchSensorPortData().then((data) => {
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
      console.log(this.dataSource.data);
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

  editDevice(obj: DeviceNode) {
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }

  async addRowData(result: any) {
    /*
    if (result.parent)
      this.sp.connectDevice(result.parent, 'sensorports[1]', result.type);
    else
      this.sp.saveDevice('sensorports[1]', result.type);

    this.selection.clear();
    this.data.removeMap(`sensorports[1]:listDevices`);
    const data = await this.fetchSensorPortData();
    if (data.length > this.dataSource.data.length) {
      this.dataSource.data = data;
      this.notificationService.openToastr(`New Device with type ${result.type} saved successfully`, 'Adding Device to Sensorports', 'done');
    } else
      this.notificationService.openToastr('Failed to save data', 'Adding Device to Sensorports', 'error');*/
  }


  private editRowData(result: any) {
    this.sp.callMethod('sensorports[1]', result);
    this.notificationService.openToastr('Device has been successfully updated (Sensorports), Virtual sensor operations for QEMU ', 'Device Modification ', 'done')
  }

  public infoDevice = (obj: DeviceNode): void => {
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
        } else {
          const selectedItems = this.selection.selected;
          selectedItems.forEach(item => {
            const index = this.dataSource.data.indexOf(item);
            if (index !== -1) {
              this.sp.removeDevice('sensorports[1]', item);
              this.dataSource.data.splice(index, 1);
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
  hasChild = (_: number, node: FlatNode) => node.expandable;

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
}
