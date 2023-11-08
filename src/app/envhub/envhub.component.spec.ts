import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvhubComponent } from './envhub.component';

describe('EnvhubComponent', () => {
  let component: EnvhubComponent;
  let fixture: ComponentFixture<EnvhubComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnvhubComponent]
    });
    fixture = TestBed.createComponent(EnvhubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
