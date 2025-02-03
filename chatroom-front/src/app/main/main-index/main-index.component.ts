import { Component, inject, OnInit, Signal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { Router } from '@angular/router';

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent implements OnInit {

	private router = inject(Router);
	chatrooms: ChatRoom[] = [];

	constructor(private messageService : MessagingService){}

	ngOnInit(): void {
		this.messageService.getRooms().then(chatrooms => {
			this.chatrooms = chatrooms;
		});

		this.messageService.chatrooms$.subscribe(chatroom => {
			console.log(chatroom)
			// Si on connait l'id, c'est une suppression, sinon c'est une création
			if(this.chatrooms.filter(cr => cr.id == chatroom.id).length > 0)
			{
				this.chatrooms.splice(this.chatrooms.indexOf(chatroom), 1)
			} else {
				this.chatrooms.push(chatroom)
			}

		});
	}

	async createChatRoom(){
		this.messageService.createChatRoom();
	}

	async getRooms(){
		this.messageService.getRooms().then(chatrooms => {
			this.chatrooms = chatrooms;
		});
	}

	async deleteChatroom(id : string){
		await this.messageService.deleteChatroom(id);
	}

	navigate(id: string){
		this.messageService.joinChatRoom(id).then(result => this.router.navigate(["/chatroom", {id: id}]));
	}
}
