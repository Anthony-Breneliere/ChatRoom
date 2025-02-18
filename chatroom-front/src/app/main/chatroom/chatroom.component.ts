import { Component, Input, Signal, computed } from '@angular/core';
import { ChatLabelComponent } from '../../_common/components/chat-label/chat-label.component';
import { ChatSvgIconComponent } from '../../_common/components/chat-svg-icon/chat-svg-icon.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { FormsModule } from '@angular/forms';
import { distinctUntilChanged, fromEvent, throttleTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/_common/models/user.model';

@Component({
	selector: 'app-chatroom',
	standalone: true,
	imports: [ChatLabelComponent, ChatSvgIconComponent, FormsModule, CommonModule],
	templateUrl: './chatroom.component.html',
})
export class ChatroomComponent {
	@Input() roomId!: string;
	@Input() user!: Signal<User | null>;

	room = computed(() => this.messagingService.joinedRooms().find(room => room.id === this.roomId));

	newMessageContent = '';
	open = true;

	constructor(private messagingService: MessagingService) {}

	ngAfterViewInit() {
		const textInput = document.getElementById(this.roomId + '-new-message-input') as HTMLInputElement;
		fromEvent(textInput, 'input')
			.pipe(throttleTime(1000), distinctUntilChanged())
			.subscribe(event => {
				this.messagingService.sendUserWriting(this.room()!.id);
			});
	}

	async leaveRoom() {
		if (this.room()) {
			await this.messagingService.leaveChatRoom(this.room()!.id);
		}
	}

	async sendMessage(event: Event) {
		event?.preventDefault();
		if (this.room()) this.messagingService.sendMessage(this.room()!.id, this.newMessageContent);
		this.newMessageContent = '';
	}

	openChatroom() {
		this.open = !this.open;
	}
}
