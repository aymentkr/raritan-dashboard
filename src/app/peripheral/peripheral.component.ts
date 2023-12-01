import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import {VPD} from "../model/interfaces";
import { Chart } from 'chart.js/auto';
import {SensorClass} from "../model/SensorClass";
import {SensorsPipe} from "../pipes/sensors.pipe";

@Component({
  selector: 'app-peripheral',
  templateUrl: './peripheral.component.html',
  styleUrls: ['./peripheral.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PeripheralComponent implements AfterViewInit {
  chart: any;
  deviceTypes = new SensorClass().getDeviceTypes();
  dataSource = new MatTableDataSource<VPD>();
  Columns: string[] = ['peripheral_id', 'name', 'type','sensor_name','sensor_type', 'serial_number'];
  chartData: number[]= []

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sp: SensorsPipe,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.ngZone.runOutsideAngular(async () => {
      await this.initMap();
      this.ngZone.run(() => {
        this.createChart();
        this.cdr.detectChanges();
      });
    });
  }

  async initMap(): Promise<void> {
    try {
      const deviceMap = this.sp.getDeviceMap();
      this.chartData = this.deviceTypes.map(() => 0);
      deviceMap.forEach((device) => {
        device.peripherals.data.forEach((peripheral) => {
          const foundIndex = this.deviceTypes.findIndex((type) => peripheral.type === type);
          if (foundIndex !== -1) {
            this.chartData[foundIndex]++;
          }
        });
      });
    } catch (error) {
      console.error('Error fetching device map:', error);
    }
  }

  createChart() {
    // Check if chart is already initialized and destroy it
    if (this.chart) {
      this.chart.destroy();
    }

    // Generate random colors for each device type
    const colors = this.deviceTypes.map(() => this.getRandomColor());

    this.chart = new Chart('virtualDevicesChart', {
      type: 'bar',
      data: {
        labels: this.deviceTypes,
        datasets: [
          {
            label: 'VPDs Types',
            data: this.chartData,
            backgroundColor: colors,
            borderColor: colors.map(color => this.adjustBrightness(color, -20)),
            borderWidth: 1,
          },
        ],
      },
    });
  }

  getRandomColor(): string {
    // Generate a random hex color code with higher brightness
    const randomColor = () => Math.floor(Math.random() * 256);
    return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.2)`;
  }

  adjustBrightness(color: string, percent: number): string {
    // Adjust brightness of a color
    const num = parseInt(color.slice(5, -4), 10);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
}
