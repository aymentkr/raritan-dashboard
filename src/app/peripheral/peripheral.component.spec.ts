import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeripheralComponent } from './peripheral.component';

describe('PeripheralComponent', () => {
  let component: PeripheralComponent;
  let fixture: ComponentFixture<PeripheralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeripheralComponent]
    });
    fixture = TestBed.createComponent(PeripheralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
