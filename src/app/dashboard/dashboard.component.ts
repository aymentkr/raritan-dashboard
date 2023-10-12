import {Component, OnInit} from '@angular/core';
import Chart from 'chart.js/auto';
import {Inlet, Pole} from "../model/interfaces";
import { DateTime } from 'luxon';
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  chart: any;
  dateLabels: string[] = [];
  PoleData : Pole = {
    id : 0,
    voltage: 0,
    current: 0,
    act_power: 0,
    app_power: 0,
    act_energy: 0,
    app_energy: 0,
  } ;

  constructor(
    private dataService: DataService,
  ) {
  }


  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.dataService.fetchInletData()
      .then((data: Inlet) => {
        this.PoleData = data.poles[0];
        this.dataService.updateHistoricalInletData(data);
        this.generateDateLabels();
        this.createChart();
      })
      .catch((error) => {
        console.error('Data fetching failed:', error);
      });
  }

  createChart() {
    this.chart = new Chart('InletChart', {
      type: 'line',
      data: {
        labels: this.dateLabels,
        datasets: [
          {
            label: 'Frequency Hz',
            data: this.dataService.getHistoricalInletData().map((item) => item.frequency),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  generateDateLabels() {
    this.dateLabels = this.dataService.getHistoricalInletData().map(() => {
      return DateTime.now().toLocaleString(DateTime.DATE_FULL);
    });
    this.dateLabels.reverse();
  }




}
