import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoom } from '../../_common/models/chat-room.model';
import { BehaviorSubject, map, Observable, Subject, Subscription, tap } from 'rxjs';
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

  private isJoinedSubscription: Subscription | undefined;

  constructor(private messagingManagerService: MessagingManagerService) {
    this.isJoined$ = this.messagingManagerService.getJoinedChatRooms$().pipe(
      map((joinedRooms) => joinedRooms.some(room => room.id === this.chatRoom.id)),
      tap(() => console.log("Changement des rooms rejointes dans le composant chatRoom Item"))
    );
  }

  // Rejoindre un chat
  private async joinChatRoom() {
    this.messagingManagerService.joinChatRoom(this.chatRoom.id);
  }

  // Quitter un chat
  private async leaveChatRoom() {
    await this.messagingManagerService.leaveChatRoom(this.chatRoom.id);
  }

  // Au click sur un chatRoom pour rejoindre ou quitter
  async chatRoomBtnClicked() {
    this.isJoinedSubscription = this.isJoined$.subscribe(async isJoined => {
      if (isJoined) {
        await this.leaveChatRoom();
        console.log("quitter", this.chatRoom.id);
      } else {
        // Sinon, on le rejoint
        await this.joinChatRoom();
        console.log("rejoindre", this.chatRoom.id);
      }
    });
  }

  // Charge le chat qui est déjà rejoins (changement de chat parmis les chats rejoins)
  async loadJoinedChatRoom() {


    TODO
    //this.chatRoom.id
  }

  // N'oublie pas de te désabonner pour éviter les fuites de mémoire
  ngOnDestroy() {
    if (this.isJoinedSubscription) {
      this.isJoinedSubscription.unsubscribe();
    }
  }
}
