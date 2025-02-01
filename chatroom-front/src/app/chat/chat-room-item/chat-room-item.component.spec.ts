import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomItemComponent } from './chat-room-item.component';

describe('ChatRoomItemComponent', () => {
  let component: ChatRoomItemComponent;
  let fixture: ComponentFixture<ChatRoomItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatRoomItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRoomItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
