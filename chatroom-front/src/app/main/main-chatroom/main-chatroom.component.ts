import { Component, computed, signal } from '@angular/core';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { FormsModule } from '@angular/forms';
import { ChatroomComponent } from '../chatroom/chatroom.component';
import { AccountService } from 'src/app/_common/services/account/account.service';

@Component({
	selector: 'app-main-chatroom',
	standalone: true,
	imports: [FormsModule, ChatroomComponent],
	templateUrl: './main-chatroom.component.html',
	styleUrl: './main-chatroom.component.scss',
})
export class MainChatroomComponent {
	rooms = computed(() => this.messagingService.rooms());
	joinedRooms = computed(() => this.messagingService.joinedRooms());
	user = computed(() => this.accountService.user());

	newRoomName = '';

	constructor(private messagingService: MessagingService, private accountService: AccountService) {}

	async ngOnInit() {
		this.messagingService.initializeChatRooms(this.user()!);
	}

	async createRoom(event: Event) {
		event?.preventDefault();
		this.messagingService.createChatRoom(this.newRoomName);
		this.newRoomName = '';
	}

	async joinRoom(roomId: string) {
		if (this.joinedRooms().length < 4) {
			this.messagingService.joinChatRoom(roomId);
		} else {
			alert('You can only join 4 rooms at a time.');
		}
	}
}
