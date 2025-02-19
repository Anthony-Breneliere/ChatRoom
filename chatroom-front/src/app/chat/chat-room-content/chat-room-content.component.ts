import { Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, fromEvent, map, of, Subscription, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/_common/models/user.model';

@Component({
  selector: 'app-chat-room-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room-content.component.html',
  styleUrl: './chat-room-content.component.scss'
})
export class ChatRoomContentComponent {

  @ViewChild('messageInput') messageInput!: ElementRef;

  public messageHistory: ChatMessage[] = [];

  public participants$: Observable<User[]> = of([]);

  public activeChatRoomId: string | null = null;

  /* SUbscriptions  */
  private _userWriteSubscription: Subscription | null = null;
  private _chatRoomIdSubscription: Subscription | null = null;
  private _chatRoomMessageHistory: Subscription | null = null;



  // Service de chat
  private _chatManagerService: MessagingManagerService

  constructor(chatManagerService: MessagingManagerService) {
    this._chatManagerService = chatManagerService;
    this.loadChatRoom();
    this.participants$ = this._chatManagerService.getParticipants$();
  }


  loadChatRoom() {
    this._chatRoomIdSubscription = this._chatManagerService.getActiveChatRoomId$()
      .subscribe(id => {
        this.activeChatRoomId = id
        //console.log("chatContent - Active chatroom recieve : ", id);
      });

    this._chatRoomMessageHistory = this._chatManagerService.getMessagesHistoryOfCurrentChatRoom$()
      .subscribe(history => {
        this.messageHistory = history
        //console.log("chatContent - Réception de l'historique : ", history);
      })
  }



  ngOnDestroy(): void {
    if (this._userWriteSubscription) {
      this._userWriteSubscription.unsubscribe();
    }
    if (this._chatRoomIdSubscription) {
      this._chatRoomIdSubscription.unsubscribe();
    }
  }

  public async sendMessage() {
    if (this.messageInput && this.messageInput.nativeElement) {
      const message = this.messageInput.nativeElement.value.trim();
      if (message) {
        console.log("Envoi du message :", message);
        await this._chatManagerService.sendMessage(message);
        this.messageInput.nativeElement.value = '';  // Effacer l'input après l'envoi du message
      }
    } else {
      console.error("messageInput n'est pas défini.");
    }
  }

  leaveChatRoom() {
    if (this.activeChatRoomId != null) {
      this._chatManagerService.leaveChatRoom(this.activeChatRoomId);
    }
  }

  async onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log("pressKey :  ", event.key);
      await this.sendMessage();
    }
  }

}
