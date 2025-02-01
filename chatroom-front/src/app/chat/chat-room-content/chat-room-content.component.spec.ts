import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomContentComponent } from './chat-room-content.component';

describe('ChatRoomContentComponent', () => {
  let component: ChatRoomContentComponent;
  let fixture: ComponentFixture<ChatRoomContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatRoomContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRoomContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
