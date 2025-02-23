import { Component,computed,OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatMessageDto as ChatMessage } from 'src/app/_common/models/chat-message.model';
import { CommonModule } from '@angular/common';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { ChatRoom } from '../../models/chat-room.model';

@Component({
  selector: 'app-chat-room',
  standalone  : true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly chatService = inject(MessagingService);
  private readonly _accountSvc = inject(AccountService);

  public roomId!: string;
  public chatroom: ChatRoom = {} as ChatRoom;
  public messages: ChatMessage[] = [];
  public newMessage: string = '';
  public currentUserId: String = this._accountSvc.getCurrentUser()?.toString() || '';
  public participants: any[] = [];
  public notifications: string[] = [];
  public editingMessage: ChatMessage | null = null;

  constructor() {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    this.chatService.getChatRoom(this.roomId).then(chatRoom => {
      this.chatroom = chatRoom;
      this.participants = chatRoom.participants;
    });
      
    this.chatService.joinChatRoom(this.roomId).then(chatHistory => {
      this.messages = chatHistory;
    });

    this.chatService.messagesSub.subscribe(message => {
      if (message.roomId === this.roomId) {
        this.messages.push(message);
      }
    });

    this.chatService.messageEditedObs.subscribe(message => {
      const index = this.messages.findIndex(m => m.id === message.id);
      if (index !== -1) {
        this.messages[index] = message;
      }
    });

    // this.chatService.messageDeletedObs.subscribe(messageId => {
    //   this.messages = this.messages.filter((m: ChatMessage) => m.id.toString() !== messageId);
    // });

    this.chatService.participantJoinedObs.subscribe((userId: string) => {
      this.notifications.push(`Participant ${userId} a rejoint la salle de chat.`);
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n !== `Participant ${userId} a rejoint la salle de chat.`);
      }, 3000);
    });

    this.chatService.participantLeftObs.subscribe((userId: string) => {
      this.notifications.push(`Participant ${userId} a quitté la salle de chat.`);
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n !== `Participant ${userId} a quitté la salle de chat.`);
      }, 3000);
    });
  }

  public sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.roomId, this.newMessage)
    }
  }

  public leaveChatRoom(): void {
    this.chatService.leaveChatRoom(this.roomId).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  public editMessage(message: ChatMessage): void {
    this.editingMessage = message;
    this.newMessage = message.content;
  }

  public deleteMessage(messageId: string): void {
    this.chatService.deleteMessage(messageId);
  }
  
}