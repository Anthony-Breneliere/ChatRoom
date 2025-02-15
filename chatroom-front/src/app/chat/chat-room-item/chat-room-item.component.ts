import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoom } from '../../_common/models/chat-room.model';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';

@Component({
  selector: 'app-chat-room-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room-item.component.html',
  styleUrl: './chat-room-item.component.scss'
})
export class ChatRoomItemComponent {
  @Input() chatRoom!: ChatRoom;

  isJoined$: Observable<boolean>;

  constructor(private messagingManagerService: MessagingManagerService) {
    this.isJoined$ = this.messagingManagerService.getJoinedChatRooms$().pipe(
      map((joinedRooms) => joinedRooms.some(room => room.id === this.chatRoom.id))
    );
  }

  private async joinChatRoom() {
    this.messagingManagerService.joinChatRoom(this.chatRoom.id);
  }

  private async leaveChatRoom() {
    await this.messagingManagerService.leaveChatRoom(this.chatRoom.id);
  }

  async chatRoomClicked() {
    if (this.isJoined$) {
      await this.joinChatRoom();
      console.log("rejoindre :", this.isJoined$)
    } else {
      await this.leaveChatRoom();
      console.log("quitter")
    }
  }
}
