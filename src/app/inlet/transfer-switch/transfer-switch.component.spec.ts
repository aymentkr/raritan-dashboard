import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferSwitchComponent } from './transfer-switch.component';

describe('TransferSwitchComponent', () => {
  let component: TransferSwitchComponent;
  let fixture: ComponentFixture<TransferSwitchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferSwitchComponent]
    });
    fixture = TestBed.createComponent(TransferSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
