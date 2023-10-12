import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToEnvhubComponent } from './add-to-envhub.component';

describe('AddToEnvhubComponent', () => {
  let component: AddToEnvhubComponent;
  let fixture: ComponentFixture<AddToEnvhubComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddToEnvhubComponent]
    });
    fixture = TestBed.createComponent(AddToEnvhubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
