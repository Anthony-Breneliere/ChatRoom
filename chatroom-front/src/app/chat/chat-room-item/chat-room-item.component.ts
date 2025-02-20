import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';
import { ChatRoom } from '../../_common/models/chat-room.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-room-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room-item.component.html',
  styleUrl: './chat-room-item.component.scss'
})
export class ChatRoomItemComponent implements OnInit, OnDestroy {
  @Input() chatRoom!: ChatRoom;

  isJoined$ = new BehaviorSubject<boolean>(false);
  private joinedSubscription!: Subscription;

  constructor(private messagingManagerService: MessagingManagerService) { }

  ngOnInit(): void {
    if (!this.chatRoom) return;

    this.joinedSubscription = this.messagingManagerService.getJoinedChatRooms$()
      .subscribe(joinedChatRooms => {
        const isJoined = joinedChatRooms.some(r => r.id === this.chatRoom.id);
        console.log("Updated")
        this.isJoined$.next(isJoined);
      });
  }

  async joinChatRoom() {
    console.log("Item join room ")
    await this.messagingManagerService.joinChatRoom(this.chatRoom.id);
  }


  // public async leaveChatRoom() {
  //   await this.messagingManagerService.leaveChatRoom(this.chatRoom.id);
  // }

  ngOnDestroy() {
    this.joinedSubscription?.unsubscribe();
  }
}
