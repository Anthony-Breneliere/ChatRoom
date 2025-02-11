import { Component, inject, input, OnInit, signal, Signal } from '@angular/core';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from 'src/app/_common/services/account/account.service';

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [FormsModule],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent implements OnInit {

	private router = inject(Router);
	public accountService = inject(AccountService);
	public readonly user = signal(this.accountService.user);
	chatrooms: ChatRoom[] = [];
	newChatroomName = "";

	constructor(private messageService : MessagingService){}

	ngOnInit(): void {
		this.messageService.getRooms().then(chatrooms => {
			this.chatrooms = chatrooms;
		});

		this.messageService.chatrooms$.subscribe(chatroom => {
			// Si on connait l'id, c'est une suppression, sinon c'est une création
			const index = this.chatrooms.findIndex(cr => cr.id === chatroom.id);
    	index !== -1 ? this.chatrooms.splice(index, 1) : this.chatrooms.push(chatroom);
		});
	}

	async createChatRoom(){
		if (this.newChatroomName.trim())
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
		this.router.navigate(["/chatroom", {id: id}]);
	}
}
