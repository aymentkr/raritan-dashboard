import {Component} from '@angular/core';
import {PeripheralClass} from "../model/PeripheralClass";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
})
export class PeripheralComponent  {
  isLoading: boolean = false;
  dataSource = new MatTableDataSource<any>();
  Columns: string[] = ['peripheral_id','device_name','device_type','sensor_type','serial_number']

  constructor( public Peripheral:PeripheralClass ) {

  }

}
