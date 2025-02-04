import { Component, computed, contentChild, signal } from "@angular/core";
import { ChatLabelComponent } from "../../_common/components/chat-label/chat-label.component";
import { MessagingService } from "src/app/_common/services/messaging/messaging.service";
import { ChatRoom } from "src/app/_common/models/chat-room.model";
import { ChatMessage } from "src/app/_common/models/chat-message.model";
import { from, Observable } from "rxjs";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";

@Component({
		selector: "app-main-chatroom",
		standalone: true,
		imports: [
    ChatLabelComponent
],
		templateUrl: "./main-chatroom.component.html",
		styleUrl: "./main-chatroom.component.scss"
})

export class MainChatroomComponent {
	rooms = computed(() => this.messagingService.rooms())
	messages = computed(() => this.messagingService.messages())
	room = signal<ChatRoom|undefined>(undefined)

	constructor (
		private messagingService: MessagingService) {}

	// async ngOnInit() {
	// 	const chatRooms = await this.messagingService.listChatRoom();
	// }

	async createRoom(){
		this.messagingService.createChatRoom();
	}

	async joinRoom(roomId:string){
		console.log(roomId)
		const messageHistory = await this.messagingService.joinChatRoom(roomId)
		this.room.set(await this.messagingService.getChatRoom(roomId))
	}

	async leaveRoom(){
		if (this.room()) {
			await this.messagingService.leaveChatRoom(this.room()!.id)
			this.room.set(undefined)
		}
	}

	async sendMessage() {
		event?.preventDefault()
		const messageContent = (document.getElementById("newMessageInput") as HTMLInputElement).value
		if (this.room())
			this.messagingService.sendMessage(this.room()!.id, messageContent)
	}
}
