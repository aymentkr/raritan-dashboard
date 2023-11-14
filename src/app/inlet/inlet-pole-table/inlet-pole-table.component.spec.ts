import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InletPoleTableComponent } from './inlet-pole-table.component';

describe('InletPoleTableComponent', () => {
  let component: InletPoleTableComponent;
  let fixture: ComponentFixture<InletPoleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InletPoleTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InletPoleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
