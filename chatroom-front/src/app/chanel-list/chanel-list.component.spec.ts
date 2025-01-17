import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChanelListComponent } from './chanel-list.component';

describe('ChanelListComponent', () => {
  let component: ChanelListComponent;
  let fixture: ComponentFixture<ChanelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChanelListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChanelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
