import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeripheralDeviceComponent } from './edit-peripheral-device.component';

describe('EditPeripheralDeviceComponent', () => {
  let component: EditPeripheralDeviceComponent;
  let fixture: ComponentFixture<EditPeripheralDeviceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditPeripheralDeviceComponent]
    });
    fixture = TestBed.createComponent(EditPeripheralDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
