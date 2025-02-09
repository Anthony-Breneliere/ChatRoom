import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce, debounceTime, distinctUntilChanged, fromEvent, of, pipe, switchMap } from 'rxjs';
import { UserDto } from 'src/app/_common/dto/user.dto';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { User } from 'src/app/_common/models/user.model';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { generateGUID, getUserFullNameBySessionStorage, getUserIdBySessionStorage } from 'src/app/_common/utils/functions';

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
	participants: UserDto[] = [];
	newMessage: string = "";
	isMessageOnEdit = false;
	editedMessageId = "";
	newMessageContent = "";
	whoIsWritting : string = "";
	private writingTimeout: any; // Stocke l'identifiant du setTimeout
	private router = inject(Router);
	constructor(private messageService : MessagingService){}

	leaveChatRoom(){
		this.messageService.leaveChatRoom(this.id, getUserIdBySessionStorage());
		this.router.navigate(["/"]);
	}

	onInputChange(){
			this.messageService.someoneIsWritting(this.id, getUserFullNameBySessionStorage());
	}

	setWrittingUser(userFullName: string) {
			// Annule le précédent timeout s'il existe
			if (this.writingTimeout) {
					clearTimeout(this.writingTimeout);
			}

			this.whoIsWritting = `${userFullName} est en train d'écrire...`;

			// Définit un nouveau timeout et stocke son identifiant
			this.writingTimeout = setTimeout(() => {
					this.whoIsWritting = "";
			}, 1000);
	}

	ngOnInit() {
    this.route.params.subscribe(params => {
       this.id = params['id'];
			 this.name = params['name'];
    });

		this.messageService.userWritting$.subscribe(userFullName => {
			this.setWrittingUser(userFullName);
		})

		this.messageService.joinChatRoom(this.id, getUserIdBySessionStorage()).then(messageHistory => {
			this.messages = messageHistory;
		});

		this.messageService.getChatRoom(this.id).then(chatroom => {
			this.participants = chatroom.participants;
		});

		this.messageService.getUserLeaveChatroomAsObservable(this.id).subscribe(obj => {
			this.messages.push({
				id: generateGUID(),
				roomId: this.id,
				authorId: "",
				authorFullName: "",
				authorCompanyId: 0,
				authorCompanyName: "",
				content: `${obj.username} a quitté la discussion`,
				createdAt: new Date(),
				updatedAt: new Date(),
				isNotificationForUser : true
			});

			if(this.participants.some(p => p.id == obj.userId))
			{
				let userLeave = this.participants.find(p => p.id == obj.userId)!;
				let indexToRemove = this.participants.indexOf(userLeave);
				this.participants.splice(indexToRemove, 1)
				return;
			}
		});

		this.messageService.getUserEnterChatroomAsObservable(this.id).subscribe(obj => {
			this.messages.push({
				id: generateGUID(),
				roomId: this.id,
				authorId: "",
				authorFullName: "",
				authorCompanyId: 0,
				authorCompanyName: "",
				content: `${obj.username} a rejoint la discussion`,
				createdAt: new Date(),
				updatedAt: new Date(),
				isNotificationForUser : true
			});

			if(!this.participants.some(p => p.id == obj.userId))
			{
				this.participants.push({
					id: obj.userId,
					email: "",
					firstName: obj.username.split(" ")[0],
					lastName: obj.username.split(" ")[1],
					phoneNumber: "",
					roles: []
				})
				return;
			}
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
