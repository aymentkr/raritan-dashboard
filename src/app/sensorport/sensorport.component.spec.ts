import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorportComponent } from './sensorport.component';

describe('SensorportComponent', () => {
  let component: SensorportComponent;
  let fixture: ComponentFixture<SensorportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
