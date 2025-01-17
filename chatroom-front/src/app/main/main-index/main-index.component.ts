import { Component, ElementRef, inject, signal, Signal, ViewChild, WritableSignal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';


@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [
		ChatSvgLogoComponent,
		ChatButtonComponent,

	],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {


	public chatRooms: WritableSignal<ChatRoom[]> = signal<ChatRoom[]>([]);

	private _chatService: MessagingService

	constructor(chatService: MessagingService) {
		this._chatService = chatService
	}


	async createNewChatRoom() {
		try {
			this.chatRooms().push(await this._chatService.createChatRoom());
		} catch (e) {
			console.log("Une erreur est survenue lors de la création du chat")
		}
	}
}
