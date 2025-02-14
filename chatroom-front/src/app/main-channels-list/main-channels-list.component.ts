import { Component, computed, inject, Input } from '@angular/core';
import { User } from 'src/app/_common/models/user.model';
import { AccountService } from '../_common/services/account/account.service';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { ChatRoom } from '../_common/models/chat-room.model';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelDetailsComponent } from '../channel-details/channel-details.component';
import { MessageDetailsComponent } from "../message-details/message-details.component";
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { NotificationService } from '../_common/services/notifications/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-channels-list',
  standalone: true,
  imports: [CommonModule, ChannelDetailsComponent],
  templateUrl: './main-channels-list.component.html',
  styleUrl: './main-channels-list.component.scss'
})
export class MainChannelsListComponent {
  constructor(private readonly _messagingSvc: MessagingService) {}

  private readonly _notificationSvc = inject(NotificationService);
  private readonly _accountSvc = inject(AccountService);
  public readonly user = computed<User | null>(this._accountSvc.user);
  public chatRooms: ChatRoom[] = [];
  public chatRoomsJoigned: ChatRoom[] = [];

  ngOnInit() {
    this._messagingSvc.roomsObservable.subscribe((rooms) => {
      this.chatRooms = rooms;
    });

    this._messagingSvc.joinedRoomsObservable.subscribe((joinedRooms) => {
      this.chatRoomsJoigned = joinedRooms;
    });

    this.getAllChannels();
  }

  public async getAllChannels(): Promise<void> {
    try {
      await this._messagingSvc.getAllChatRooms();
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
    }
  }

	public joinChatRoom(roomId: string): void {
		if (!this.chatRoomsJoigned.some((room) => room.id === roomId)) {
			this._messagingSvc.joinChatRoom(roomId).subscribe(
				(updatedRoom) => {
				},
				(error) => {
					console.error('Erreur lors de la tentative de rejoindre la salle:', error);
				}
			);
		}
	}

	public leaveChatRoom(room: ChatRoom): void {
		this._messagingSvc.leaveChatRoom(room.id).subscribe({
			next: () => {
			},
			error: (error) => {
				console.error(`Erreur lors de la tentative de quitter la salle : ${room.id}`, error);
			},
		});
	}

	public isRoomJoined(roomId: string): boolean {
    return this.chatRoomsJoigned.some(room => room.id === roomId);
  }

	public async createChannel(){
		var chatRoom : ChatRoom = await this._messagingSvc.createChatRoom();
	}
}
