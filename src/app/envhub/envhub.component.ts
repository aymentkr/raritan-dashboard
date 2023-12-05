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
import {Peripheral, DeviceFlatNode} from "../model/interfaces";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {SensorsPipe} from "../pipes/sensors.pipe";
import {NotificationService} from "../services/notification.service";
import {DataService} from "../services/data.service";
import {AddPeripheralDeviceComponent} from "../peripheral/add-peripheral-device/add-peripheral-device.component";
import {EditPeripheralDeviceComponent} from "../peripheral/edit-peripheral-device/edit-peripheral-device.component";
import {DeleteDeviceDialogComponent} from "../peripheral/delete-device-dialog/delete-device-dialog.component";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {FlatTreeControl} from "@angular/cdk/tree";

@Component({
  selector: 'app-envhub',
  templateUrl: './envhub.component.html',
  styleUrls: ['./envhub.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EnvhubComponent implements OnInit{
  isLoading: boolean = true;
  selectedDevice: DeviceFlatNode | null = null;
  innercolumns: string[] = ['peripheral_id', 'name', 'type'];
  displayedColumns : string[] = ['device_id', 'name', 'type', 'serial_number','actions'];
  state!: boolean;

  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<Peripheral>>;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  // Define treeControl, treeFlattener, and dataSource as class properties
  treeControl : FlatTreeControl<DeviceFlatNode>[] = [];
  treeFlattener : MatTreeFlattener<any, any>[] = [];
  dataSource: MatTreeFlatDataSource<any, any>[] = [];

  constructor(
    private dialog: MatDialog,
    private sp: SensorsPipe,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private data: DataService
  ) {}

  async ngOnInit(): Promise<void> {
    const size = parseFloat(await this.data.getResult('#envhubs', 'print(#envhubs)'));
    if (size === 1) {
      for (let i = 0; i < 4; i++) {
        // Define treeControl, treeFlattener, and dataSource as class properties
        this.treeControl[i] = new FlatTreeControl<DeviceFlatNode>(
          node => node.level,
          node => node.expandable
        );
        this.treeFlattener[i] = new MatTreeFlattener(
          this.sp._transformer,
          node => node.level,
          node => node.expandable,
          node => node.tailports,
        );
        this.dataSource[i] = new MatTreeFlatDataSource(this.treeControl[i], this.treeFlattener[i]);
        this.fetchEnvhubsData(i)
          .then(() => {
            this.cdRef.detectChanges();
            this.isLoading = false;
          })
          .catch((error) => {
            console.error('Data fetching failed:', error);
          });
      }
    }
  }

  async fetchEnvhubsData(i:number) {
    const topology = await this.data.getResult(`envhubs[1]:getPort(${i}):getTopology`, `print(envhubs[1]:getPort(${i}):getTopology())`);
    this.dataSource[i].data =  this.sp.convertToDevices(JSON.parse(topology));
    this.treeControl[i].expandAll();
  }


  addDevice(i:number) {
    this.isEmpty().then(_bool => {
      if (_bool)
        this.notificationService.openToastr("Sorry! You can't add any virtual peripheral device in QEMU currently :(", 'Adding Device to Sensorports', 'info');
      else {
        const dialogRef = this.dialog.open(AddPeripheralDeviceComponent,{
          data: this.dataSource[i].data
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.addRowData(i,result.data).then(() => {
              this.cdRef.detectChanges();
            });
          }
        });
      }
    })
  }

  editDevice(obj: Peripheral, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditPeripheralDeviceComponent, {
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.editRowData(result.data);
    });
  }


  async addRowData(i:number,data:any ) {
    if (data.type) {
      this.sp.saveDevice(`envhubs[1]:getPort(${i})`, data);
      this.data.removeMap(`envhubs[1]:getPort(${i}):getTopology`);
      await this.fetchEnvhubsData(i);
      this.notificationService.openToastr(`New Device with type ${data.type} in Port ${i} saved successfully`, 'Adding Device to Envhubs', 'done');
    }
    else
      this.notificationService.openToastr('Failed to save data','Adding Device to Envhubs','error');
  }

  private editRowData(data: any) {
    this.sp.callMethod('envhubs[1]',data);
    this.notificationService.openToastr('Device has been successfully updated (Envhubs), Virtual sensor operations for QEMU ','Device Modification ','done')
  }

  infoDevice(obj: DeviceFlatNode, event: Event): void {
    event.stopPropagation();
    this.sp.infoDevice(obj);
  };
  setFuseState(i: number) {
    if (this.state){
      this.sp.setFuseState(i,this.state);
      this.notificationService.openToastr(`Fuse State in Port ${i} has been successfully updated`, `Envhubs: Modification in Port ${i}`, 'done');
    } else  {
      this.notificationService.openToastr('You have to select an option first','Envhubs : setFuseState(true/false)','info')
    }
  }

  removeAll(i:number) {
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: 'you want to remove all devices?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap(`envhubs[1]:getPort(${i}):getTopology`);
        this.sp.removeAll(`envhubs[1]:getPort(${i})`);
        this.dataSource[i].data = [];
        this.notificationService.openToastr('All devices deleted successfully from Envhubs', `Deleting Devices in Port ${i}`, 'warning');
      }
    });
  }

  deleteDevice(i:number, device: DeviceFlatNode, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteDeviceDialogComponent, {
      width: '600px',
      maxHeight: '400px',
      data: `You want to remove the selected Device ${device.device_id}?` ,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.removeMap(`envhubs[1]:getPort(${i}):getTopology`);
        this.sp.removeDevice(`envhubs[1]:getPort(${i})`, device);
        this.fetchEnvhubsData(i).then(() => {
          this.notificationService.openToastr(`Selected Device ${device.device_id}deleted successfully from Envhubs`, `Deleting Devices in Port ${i}`, 'warning');
        });
      }
    });
  }

  async isEmpty(): Promise<boolean> {
    return await this.sp.getLength('envhubs') == 0;
  }

  toggleDeviceDetails(device: DeviceFlatNode, event: Event): void {
    event.stopPropagation();
    this.selectedDevice = this.selectedDevice === device ? null : device;
    this.cdRef.detectChanges();
  }

}
