import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {VPD} from "../model/interfaces";

@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PeripheralComponent implements OnInit{
  dataSource = new MatTableDataSource<VPD>();
  Columns: string[] = ['peripheral_id','device_name','device_type','sensor_type','serial_number']

  constructor( private ngZone: NgZone, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.ngZone.run(() => {
      this.cdr.detectChanges();
    })
  }


}
