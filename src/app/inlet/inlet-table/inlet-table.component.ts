import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableDataSource} from "@angular/material/table";
import {Inlet} from "../../model/interfaces";

@Component({
  selector: 'app-inlet-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inlet-table.component.html',
  styleUrl: './inlet-table.component.css'
})
export class InletTableComponent {
  @Input() inputFromParent = 0 ;

}
