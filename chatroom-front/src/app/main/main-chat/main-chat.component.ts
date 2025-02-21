import { Component, signal } from '@angular/core';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { MainChatRoomComponent } from './main-chat-room/main-chat-room.component';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-main-chat',
	standalone: true,
	templateUrl: './main-chat.component.html',
	imports: [MainChatRoomComponent],
	providers: [MessagingService],
})
export class MainChatComponent {
	rooms = signal<ChatRoom[]>([]);
	joinedRooms = signal<Set<string>>(new Set());

	private _subscriptions = new Subscription();

	constructor(private messagingService: MessagingService) {}

	async ngOnInit() {
		const room = await this.messagingService.getChatRooms();
		this.rooms.set(room);

		this._subscriptions.add(
			this.messagingService.newChatRoom$.subscribe(room => {
				this.rooms.update(rooms => {
					rooms.push(room);

					return rooms;
				});
			})
		);
	}

	ngOnDestroy() {
		this._subscriptions.unsubscribe();
	}

	async createChatRoom() {
		const roomName = prompt('Nom du chat :');

		if (!roomName) {
			return;
		}

		const room = await this.messagingService.createChatRoom(roomName);

		this.joinChatRoom(room.id);
	}

	joinChatRoom(roomId: string) {
		const isAlreadyJoined = this.joinedRooms().has(roomId);
		const maxRoomJoinedReached = this.joinedRooms().size >= 3;

		if (isAlreadyJoined || maxRoomJoinedReached) {
			return;
		}

		this.joinedRooms.update(joinedRooms => {
			joinedRooms.add(roomId);

			return joinedRooms;
		});
	}

	leaveChatRoom(roomId: string) {
		this.joinedRooms.update(joinedRooms => {
			joinedRooms.delete(roomId);

			return joinedRooms;
		});
	}
}
