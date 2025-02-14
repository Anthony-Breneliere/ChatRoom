import { Component, computed, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MessageDetailsComponent } from "../message-details/message-details.component";
import { ChatRoom } from '../_common/models/chat-room.model';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../_common/services/notifications/notification.service';
import { User } from '../_common/models/user.model';
import { UserDto } from '../_common/dto/user.dto';
import { AccountService } from '../_common/services/account/account.service';

@Component({
  selector: 'app-channel-details',
  standalone: true,
  imports: [FormsModule, CommonModule, MessageDetailsComponent],
  templateUrl: './channel-details.component.html',
  styleUrl: './channel-details.component.scss'
})
export class ChannelDetailsComponent {
  constructor(private readonly _messagingSvc: MessagingService) {}

  private readonly _notificationSvc = inject(NotificationService);
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
  @Input() room!: ChatRoom;
  @Input() chatRoomsJoigned!: ChatRoom[];
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messageContent: string = '';
  newUserMessages: string[] = [];
  roomId: string = '';
  userListVisible: boolean = false;
	users : UserDto[] = [];
	typingMessages: string[] = [];


  ngOnInit() {
    this._notificationSvc.newUsers$.subscribe(messages => {
      this.newUserMessages = messages
        .filter(msg => msg.roomId === this.room.id)
        .map(msg => msg.message);
    });

		this._messagingSvc.roomsObservable.subscribe(rooms => {
      const updatedRoom = rooms.find(r => r.id === this.room.id);
      if (updatedRoom) {
        this.users = updatedRoom.participants;  // Met à jour la liste des utilisateurs
      }
    });
  }

  public leaveChatRoom(room: ChatRoom): void {
    this._messagingSvc.leaveChatRoom(room.id).subscribe({
      next: () => {
        this._notificationSvc.clearMessagesForRoom(this.room.id);
      },
      error: (error) => {
        console.error(`Erreur lors de la tentative de quitter la salle : ${room.id}`, error);
      },
    });
  }

  public sendMessage(content: string) {
    if (content.trim() && this.room) {
      this._messagingSvc.sendMessage(this.room.id, content).subscribe({
        next: () => this.messageContent = '',
        error: (err) => console.error('Erreur envoi message', err),
      });
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleUserList() {
    this.userListVisible = !this.userListVisible;
  }

	public userIsTyping(){
		if (this.room && this.user()) {
			this._messagingSvc.userIsTyping(this.room.id, this.user()!);
		}
	}

	get typingMessage(): string | null {
		const typingData = this._notificationSvc.getUserTypingMessage();
		return typingData && typingData.roomId === this.room.id ? typingData.message : null;
	}
}
