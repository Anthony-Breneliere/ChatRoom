import { ChangeDetectorRef, Component, ElementRef, inject, QueryList, signal, Signal, ViewChild, ViewChildren, WritableSignal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { ChatRoomItemComponent } from "../../chat/chat-room-item/chat-room-item.component";
import { distinctUntilChanged, filter, fromEvent, map, merge, Observable } from 'rxjs';
import { ChatRoomContentComponent } from "../../chat/chat-room-content/chat-room-content.component";


@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [
		ChatRoomItemComponent,
		ChatRoomContentComponent
	],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {

	//ensemble des chats rooms disponibles
	public chatRooms: WritableSignal<ChatRoom[]> = signal<ChatRoom[]>([]);

	// Service de chat
	private _chatService: MessagingService



	// Ctor
	constructor(chatService: MessagingService) {
		this._chatService = chatService
	}

	ngOnInit() {
		this._loadAllChatRooms();
	}


	async createNewChatRoom() {
		try {
			this.chatRooms().push(await this._chatService.createChatRoom());
		} catch (e) {
			console.log("Une erreur est survenue lors de la création du chat");
		}
	}

	private async _loadAllChatRooms() {
		this.chatRooms.set(await this._chatService.getAllChatRooms());
	}

	async joinChat(chatId: string) {
		await this._chatService.joinChatRoom(chatId);
	}
}
