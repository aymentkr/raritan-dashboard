import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-bottom-sheet-info',
  templateUrl: './bottom-sheet-info.component.html',
  styleUrls: ['./bottom-sheet-info.component.css']
})
export class BottomSheetInfoComponent {
  length = 0;
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {length:number}) {
    this.length = data.length;
  }
}
