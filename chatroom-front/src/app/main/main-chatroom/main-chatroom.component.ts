import { Component } from "@angular/core";
import { ChatInputComponent } from "src/app/_common/components/chat-input/chat-input.component";
import { ChatLabelComponent } from "../../_common/components/chat-label/chat-label.component";
import { MessagingService } from "src/app/_common/services/messaging/messaging.service";

@Component({
		selector: "app-main-chatroom",
		standalone: true,
		imports: [
    ChatInputComponent,
    ChatLabelComponent
],
		templateUrl: "./main-chatroom.component.html",
		styleUrl: "./main-chatroom.component.scss"
})

export class MainChatroomComponent {
	constructor (private messagingService: MessagingService) {}

	ngOnInit() {
		this.messagingService
	}
}
