import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BringBackComponent } from './bring-back.component';

describe('BringBackComponent', () => {
  let component: BringBackComponent;
  let fixture: ComponentFixture<BringBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BringBackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BringBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
