import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';

@Component({
  selector: 'app-main-chatroom',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './main-chatroom.component.html',
  styleUrl: './main-chatroom.component.scss'
})
export class MainChatroomComponent implements OnInit {

	private route = inject(ActivatedRoute);
	id: string = "Nothing";
	name: string = "";
	chatroom!: ChatRoom;
	messages: ChatMessage[] = [];
	newMessage: string = "";
	isMessageOnEdit = false;
	editedMessageId = "";
	newMessageContent = "";

	constructor(private messageService : MessagingService){}

	ngOnInit() {
    this.route.params.subscribe(params => {
       this.id = params['id'];
			 this.name = params['name'];
    });

		this.messageService.joinChatRoom(this.id).then(messageHistory => {
			this.messages = messageHistory;
		});

		this.messageService.messages$.subscribe(message => {
			// Si le message ne concerne pas ce chat
			if(this.id != message.roomId)
				return;

			// Si l'id n'est pas connu, c'est un nouveau message
			if(!this.messages.some(cr => cr.id == message.id))
			{
				this.messages.push(message);
				return;
			}

			// Si le contenu n'as pas été modifié, alors c'est une suppression
			// Sinon c'est une mise à jour
			if(this.messages.some(cr => cr.content == message.content))
			{
				let deletedMessage = this.messages.find(cr => cr.roomId == message.roomId && cr.id == message.id)!;
				let indexToRemove = this.messages.indexOf(deletedMessage);
				this.messages.splice(indexToRemove, 1)
				return;
			}
			else
			{
				this.messages.find(cr => cr.roomId == message.roomId && cr.id == message.id)!.content = message.content;
				return;
			}
		});
  }

	setEditedMessageId(messageId: string){
		this.isMessageOnEdit = true;
		this.editedMessageId = messageId;
	}

	setnewMessageContent(newMessageContent: string){
		this.newMessageContent = newMessageContent;
	}

	async sendMessage(){
		this.messageService.sendMessage(this.id, this.newMessage);
		this.newMessage = "";
	}

	async updateMessage(){
		if(!this.newMessageContent)
			return;
		this.messageService.updateMessage(this.editedMessageId, this.newMessageContent);
		this.isMessageOnEdit = false;
	}

	async deleteMessage(messageId : string){
		this.messageService.deleteMessage(messageId);
	}
}
