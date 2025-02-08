import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainChatRoomComponent } from './main-chat-room.component';

describe('MainChatRoomComponent', () => {
  let component: MainChatRoomComponent;
  let fixture: ComponentFixture<MainChatRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainChatRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainChatRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
