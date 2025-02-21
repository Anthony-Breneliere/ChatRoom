import { Component } from '@angular/core';
import { MainHeaderComponent } from '../main/main-header/main-header.component';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { ChanelComponent } from '../chanel/chanel.component';
import { ChatRoom } from '../_common/models/chat-room.model';

@Component({
	selector: 'app-chanel-list',
	standalone: true,
	imports: [MainHeaderComponent, CommonModule, ChanelComponent],
	templateUrl: './chanel-list.component.html',
	styleUrl: './chanel-list.component.scss',
})
export class ChanelListComponent {
	allRooms: any;
	roomsJoined: ChatRoom[] = [];
	constructor(private messagingService: MessagingService) {}

	ngOnInit() {
		this.messagingService.getAllChatRoom();
		this.messagingService.rooms$.subscribe(rooms => {
			this.allRooms = rooms;
			console.log(this.allRooms)
		});

		this.messagingService.joinedRoomsObservable$.subscribe(rooms => {
			this.roomsJoined = rooms;
		});
	}

	createChatRoom() {
		const chatRoom = this.messagingService.createChatRoom();
	}

	joinChatRoom(offerId: string) {
		if (!this.roomsJoined.some(room => room.id === offerId)) {
			this.messagingService.joinChatRoom(offerId).subscribe(
				() => {
				},
				(error) => {
					console.error('Erreur lors de la tentative de rejoindre la salle:', error);
				}
			);
		}
	}
}
