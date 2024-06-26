import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InletComponent } from './inlet.component';

describe('InletComponent', () => {
  let component: InletComponent;
  let fixture: ComponentFixture<InletComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InletComponent]
    });
    fixture = TestBed.createComponent(InletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
