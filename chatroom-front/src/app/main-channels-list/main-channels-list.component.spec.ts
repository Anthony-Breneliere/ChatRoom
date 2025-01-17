import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainChannelsListComponent } from './main-channels-list.component';

describe('MainChannelsListComponent', () => {
  let component: MainChannelsListComponent;
  let fixture: ComponentFixture<MainChannelsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainChannelsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainChannelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
