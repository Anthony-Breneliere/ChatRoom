import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';

@Component({
  selector: 'app-main-chatroom',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './main-chatroom.component.html',
  styleUrl: './main-chatroom.component.scss'
})
export class MainChatroomComponent implements OnInit {

	private route = inject(ActivatedRoute);
	id: string = "Nothing";
	chatroom!: ChatRoom;
	messages: ChatMessage[] = [];
	newMessage: string = "";

	constructor(private messageService : MessagingService){}

	ngOnInit() {
    this.route.params.subscribe(params => {
       this.id = params['id'];
    });

		this.messageService.joinChatRoom(this.id).then(messageHistory => {
			this.messages = messageHistory;
		});

		this.messageService.messages$.subscribe(message => {
			this.messages.push(message);
			this.newMessage = "";
		});
  }

	async sendMessage(){
		this.messageService.sendMessage(this.id, this.newMessage);
	}
}
