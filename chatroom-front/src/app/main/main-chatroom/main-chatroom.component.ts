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
	originalMessageContent = "";
	whoIsWritting : string = "";
	private writingTimeout: any; // Stocke l'identifiant du setTimeout
	private router = inject(Router);
	constructor(private messageService : MessagingService){}

	leaveChatRoom(){
		this.messageService.leaveChatRoom(this.id, getUserIdBySessionStorage());
		this.router.navigate(["/"]);
	}

	// To push a notification than someone is writting (we use the id of the room and the fullname of the connected user who is writting)
	onInputChange(){
			this.messageService.someoneIsWritting(this.id, getUserFullNameBySessionStorage());
	}

	// Use to show who is writting and till 1s after he stoped to write
	setWrittingUser(userFullName: string) {
			// Annule le précédent timeout s'il existe, important pour eviter des comportement d'affichages hasardeux
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

		// GET THE IMPORTANT PARAMS
    this.route.params.subscribe(params => {
       this.id = params['id'];
    });

		// USE TO GET THE ACTUAL PARTICIPANTS OF THE CHATROOM
		this.messageService.getChatRoom(this.id).then(chatroom => {
			this.name = chatroom.name;
			this.participants = chatroom.participants;
		});

		// GET THE MESSAGE HISTORY OF THE CHATROOM
		this.messageService.joinChatRoom(this.id, getUserIdBySessionStorage()).then(messageHistory => {
			this.messages = messageHistory;
		});

		// HANDLE EVENT WHEN SOMEONE IS WRITTING AND SHOW IT ON UI
		this.messageService.userWritting$.subscribe(userFullName => {
			this.setWrittingUser(userFullName);
		})

		// OBSERVABLE TO HANDLE USER WHO IS LEAVING THE CHATROOM
		this.messageService.getUserLeaveChatroomAsObservable(this.id).subscribe(obj => {

			// To push a specific line to show the user who is leaving the chatroom
			this.messages.push({
				id: generateGUID(),
				roomId: this.id,
				content: `${obj.username} a quitté la discussion`,
				isNotificationForUser : true
			});

			// To remove and show the leaved participant on UI
			const index = this.participants.findIndex(p => p.id === obj.userId);
    	if (index !== -1) this.participants.splice(index, 1);
		});

		// OBSERVABLE TO HANDLE USER WHO IS ENTERRING THE CHATROOM
		this.messageService.getUserEnterChatroomAsObservable(this.id).subscribe(obj => {

			// To push a specific line to show the user who is enterring the chatroom
			this.messages.push({
				id: generateGUID(),
				roomId: this.id,
				content: `${obj.username} a rejoint la discussion`,
				isNotificationForUser : true
			});

			// To push and show the new participant on UI
			if(!this.participants.some(p => p.id == obj.userId))
			{
				this.participants.push({
					id: obj.userId,
					firstName: obj.username.split(" ")[0],
					lastName: obj.username.split(" ")[1],
				})
				return;
			}
		});

		// OBSERVABLE TO HANDLE WHEN A MESSAGE IS CREATED / UDATED / DELETED
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

	// Set the edited message id
	setEditedMessageId(messageId: string){
		this.isMessageOnEdit = true;
		this.editedMessageId = messageId;
	}

	// Set on the input the content of the message than the user want to edit (to get at least the original message content before any modification)
	setnewMessageContent(originalMessageContent: string){
		this.originalMessageContent = originalMessageContent;
		this.newMessageContent = originalMessageContent;
	}

	// Send a new message
	async sendMessage(){
		this.messageService.sendMessage(this.id, this.newMessage);
		this.newMessage = "";
	}

	// update a message with a new content
	async updateMessage(){
		if(this.isEmptyMessageOrContentIsntDifferentFromOriginal())
		{
			this.isMessageOnEdit = false;
			return;
		}
		this.messageService.updateMessage(this.editedMessageId, this.newMessageContent);
		this.isMessageOnEdit = false;
	}

	// Check if the edited message is empty or if the content haven't changed
	isEmptyMessageOrContentIsntDifferentFromOriginal() : boolean{
		return !this.newMessageContent || this.originalMessageContent == this.newMessageContent;
	}

	// delete a message
	async deleteMessage(messageId : string){
		this.messageService.deleteMessage(messageId);
	}
}
