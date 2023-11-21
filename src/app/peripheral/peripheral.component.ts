import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { VPD } from "../model/interfaces";
import * as Chart from 'chart.js';

@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PeripheralComponent implements AfterViewInit {
  chart: any;
  dataSource = new MatTableDataSource<VPD>();
  Columns: string[] = ['peripheral_id', 'device_name', 'device_type', 'sensor_type', 'serial_number'];

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.ngZone.run(() => {
      this.createChart();
      this.cdr.detectChanges();
    });
  }
  createChart() {
    this.chart = new Chart('InletChart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Frequency Hz',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {

        },
      },
    });
  }


}
