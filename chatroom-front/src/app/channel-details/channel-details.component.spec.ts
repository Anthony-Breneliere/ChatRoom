import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDetailsComponent } from './channel-details.component';

describe('ChannelDetailsComponent', () => {
  let component: ChannelDetailsComponent;
  let fixture: ComponentFixture<ChannelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
