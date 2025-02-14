import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCreateChannelComponent } from './main-create-channel.component';

describe('MainCreateChannelComponent', () => {
  let component: MainCreateChannelComponent;
  let fixture: ComponentFixture<MainCreateChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCreateChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCreateChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
