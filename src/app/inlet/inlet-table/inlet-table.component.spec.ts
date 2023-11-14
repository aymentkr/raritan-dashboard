import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InletTableComponent } from './inlet-table.component';

describe('InletTableComponent', () => {
  let component: InletTableComponent;
  let fixture: ComponentFixture<InletTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InletTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InletTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
