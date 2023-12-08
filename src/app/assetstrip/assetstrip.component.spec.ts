import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetstripComponent } from './assetstrip.component';

describe('AssetstripComponent', () => {
  let component: AssetstripComponent;
  let fixture: ComponentFixture<AssetstripComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetstripComponent]
    });
    fixture = TestBed.createComponent(AssetstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
