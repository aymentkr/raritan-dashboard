import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';

import {animate, state, style, transition, trigger} from "@angular/animations";

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
  ]
})
export class EnvhubComponent implements OnInit{
  ngOnInit(): void {
  }

}
