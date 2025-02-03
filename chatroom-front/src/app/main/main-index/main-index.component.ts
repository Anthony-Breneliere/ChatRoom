import { Component, inject, OnInit, Signal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent, FormsModule],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent implements OnInit {

	private router = inject(Router);
	chatrooms: ChatRoom[] = [];
	newChatroomName = "";

	constructor(private messageService : MessagingService){}

	ngOnInit(): void {
		this.messageService.getRooms().then(chatrooms => {
			this.chatrooms = chatrooms;
		});

		this.messageService.chatrooms$.subscribe(chatroom => {
			// Si on connait l'id, c'est une suppression, sinon c'est une création
			if(this.chatrooms.some(cr => cr.id == chatroom.id))
			{
				let deletedChatroom = this.chatrooms.find(cr => cr.id == chatroom.id)!;
				let indexToRemove = this.chatrooms.indexOf(deletedChatroom);
				this.chatrooms.splice(indexToRemove, 1)
			} else {
				this.chatrooms.push(chatroom)
			}

		});
	}

	async createChatRoom(){
		if(this.newChatroomName != "")
		{
			this.messageService.createChatRoom(this.newChatroomName);
			this.newChatroomName = "";
		}
	}

	async getRooms(){
		this.messageService.getRooms().then(chatrooms => {
			this.chatrooms = chatrooms;
		});
	}

	async deleteChatroom(id : string){
		await this.messageService.deleteChatroom(id);
	}

	navigate(id: string, name: string){
		this.messageService.joinChatRoom(id).then(result => this.router.navigate(["/chatroom", {id: id, name: name}]));
	}
}
