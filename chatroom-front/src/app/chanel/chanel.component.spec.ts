import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChanelComponent } from './chanel.component';

describe('ChanelComponent', () => {
  let component: ChanelComponent;
  let fixture: ComponentFixture<ChanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
