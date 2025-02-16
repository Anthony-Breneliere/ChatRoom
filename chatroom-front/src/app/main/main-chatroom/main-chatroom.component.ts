import { Component, computed, contentChild, signal } from "@angular/core";
import { ChatLabelComponent } from "../../_common/components/chat-label/chat-label.component";
import { MessagingService } from "src/app/_common/services/messaging/messaging.service";
import { ChatRoom } from "src/app/_common/models/chat-room.model";
import { ChatMessage } from "src/app/_common/models/chat-message.model";
import { from, Observable } from "rxjs";
import { FormBuilder, FormGroup, FormControl, FormsModule } from "@angular/forms";
import { ChatButtonComponent } from "src/app/_common/components/chat-button/chat-button.component";
import { ChatButtonGroupComponent } from "src/app/_common/components/chat-button-group/chat-button-group.component";
import { ChatInputComponent } from "src/app/_common/components/chat-input/chat-input.component";
import { ChatModalComponent } from "src/app/_common/components/chat-modal/chat-modal.component";
import { ChatNotificationComponent } from "src/app/_common/components/chat-notification/chat-notification.component";
import { ChatSvgIconComponent } from "../../_common/components/chat-svg-icon/chat-svg-icon.component";
import { ChatTabsComponent } from "../../_common/components/chat-tabs/chat-tabs.component";
import { ChatSwitchComponent } from "../../_common/components/chat-switch/chat-switch.component";
import { ChatSuggestionsCard } from "../../_common/components/chat-new-request-button/chat-suggestions-card.component";
import { NgModel } from "@angular/forms";
import { ChatroomComponent } from "../chatroom/chatroom.component";
import { ApiUserService } from "src/app/_common/services/api/api-user/api-user.service";
import { AccountService } from "src/app/_common/services/account/account.service";

@Component({
		selector: "app-main-chatroom",
		standalone: true,
		imports: [
    ChatLabelComponent,
    ChatInputComponent,
    ChatSvgIconComponent,
    ChatSwitchComponent,
    ChatSuggestionsCard,
    ChatButtonComponent,
    ChatButtonGroupComponent,
    FormsModule,
    ChatroomComponent
],
		templateUrl: "./main-chatroom.component.html",
		styleUrl: "./main-chatroom.component.scss"
})

export class MainChatroomComponent {
	rooms = computed(() => this.messagingService.rooms())
	joinedRooms = computed(() => this.messagingService.joinedRooms())
	messages = computed(() => this.messagingService.messages())
	room = signal<ChatRoom|undefined>(undefined)
	user = computed(() => this.accountService.user())

	newRoomName = ""

	constructor (
		private messagingService: MessagingService,
		private accountService: AccountService){}

	// async ngOnInit() {
	// 	const chatRooms = await this.messagingService.listChatRoom();
	// }

	async createRoom(event : Event) {
		event?.preventDefault()
		console.log(this.newRoomName)
		this.messagingService.createChatRoom(this.newRoomName);
		this.newRoomName = ""
	}

	async joinRoom(roomId:string){
		console.log(roomId)

		this.messagingService.joinChatRoom(roomId)
		const joinedRoom = await this.messagingService.getChatRoom(roomId)
		this.room.set(joinedRoom)
	}

	async leaveRoom(){
		if (this.room()) {
			await this.messagingService.leaveChatRoom(this.room()!.id)
			this.room.set(undefined)
		}
	}
}
