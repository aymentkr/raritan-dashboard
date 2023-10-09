import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPeripheralDeviceComponent } from './add-peripheral-device.component';

describe('AddPeripheralDeviceComponent', () => {
  let component: AddPeripheralDeviceComponent;
  let fixture: ComponentFixture<AddPeripheralDeviceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPeripheralDeviceComponent]
    });
    fixture = TestBed.createComponent(AddPeripheralDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
