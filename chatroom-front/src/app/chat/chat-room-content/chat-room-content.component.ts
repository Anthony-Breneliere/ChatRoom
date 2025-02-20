import { Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, fromEvent, map, of, Subscription, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/_common/models/user.model';
import { UserDto } from 'src/app/_common/dto/user.dto';

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

  public participants$ = new BehaviorSubject<UserDto[]>([]);

  public activeChatRoomId: string | null = null;

  public isTyping = false;

  /* SUbscriptions */
  private _userWriteSubscription: Subscription | null = null;
  private _chatRoomIdSubscription: Subscription | null = null;
  private _chatRoomMessageHistory: Subscription | null = null;
  private _chatRoomParticipantsSubscription: Subscription | null = null;



  // Service de chat
  private _chatManagerService: MessagingManagerService

  constructor(chatManagerService: MessagingManagerService) {
    this._chatManagerService = chatManagerService;

    //this.participants$ = this._chatManagerService.getParticipants$();
  }


  ngOnInit() {
    this.loadChatRoom();
  }

  loadChatRoom() {
    // Peut être fusionner les deux ... sachant que history by room réagit en fonction de activeChatRoom
    this._chatRoomMessageHistory = this._chatManagerService.getMessagesHistoryOfCurrentChatRoom$()
      .subscribe(history => {
        this.messageHistory = history
      });

    this._chatRoomIdSubscription = this._chatManagerService.getActiveChatRoomId$()
      .subscribe(id => {
        this.activeChatRoomId = id
      });


    this._chatRoomParticipantsSubscription = this._chatManagerService.getJoinedChatRooms$()
      .subscribe((joinedChatRooms) => {

        if (this.activeChatRoomId) {

          const activeChatRoom = joinedChatRooms.find(room => room.id === this.activeChatRoomId);
          if (activeChatRoom) {
            this.participants$.next(activeChatRoom.participants);
          }
        }
      });
  }



  ngOnDestroy(): void {
    if (this._userWriteSubscription) {
      this._userWriteSubscription.unsubscribe();
    }
    if (this._chatRoomIdSubscription) {
      this._chatRoomIdSubscription.unsubscribe();
    }
    if (this._chatRoomMessageHistory) {
      this._chatRoomMessageHistory.unsubscribe();
    }
    if (this._chatRoomParticipantsSubscription) {
      this._chatRoomParticipantsSubscription.unsubscribe();
    }
  }

  public async sendMessage() {
    if (this.messageInput && this.messageInput.nativeElement) {
      const message = this.messageInput.nativeElement.value.trim();
      if (message) {
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
    //Notification isTyping

    if (event.key === 'Enter') {
      console.log("pressKey :  ", event.key);
      await this.sendMessage();
    }
  }

}
