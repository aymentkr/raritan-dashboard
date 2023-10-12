import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartlockComponent } from './smartlock.component';

describe('SmartlockComponent', () => {
  let component: SmartlockComponent;
  let fixture: ComponentFixture<SmartlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmartlockComponent]
    });
    fixture = TestBed.createComponent(SmartlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
