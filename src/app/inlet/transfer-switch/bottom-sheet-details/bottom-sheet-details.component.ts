import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";
import {Switch} from "../../../model/interfaces";

@Component({
  selector: 'app-bottom-sheet-details',
  templateUrl: './bottom-sheet-details.component.html',
  styleUrls: ['./bottom-sheet-details.component.css']
})
export class BottomSheetDetailsComponent {
  formData!: Switch
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {formData:Switch}) {
    this.formData = data.formData;
  }
}
