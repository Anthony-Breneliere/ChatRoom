import { ChangeDetectorRef, Component, ElementRef, inject, QueryList, signal, Signal, ViewChild, ViewChildren, WritableSignal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { ChatRoomItemComponent } from "../../chat/chat-room-item/chat-room-item.component";
import { distinctUntilChanged, filter, fromEvent, map, merge, Observable } from 'rxjs';
import { ChatRoomContentComponent } from "../../chat/chat-room-content/chat-room-content.component";
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';
import { CommonModule } from '@angular/common';


@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [
		ChatRoomItemComponent,
		ChatRoomContentComponent,
		CommonModule
	],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {

	@ViewChild('chatName') chatNameInput!: ElementRef;


	chatRooms$: Observable<ChatRoom[]>;

	constructor(private messagingManagerService: MessagingManagerService) {
		this.chatRooms$ = this.messagingManagerService.getAllChatRooms$();
	}

	ngOnInit(): void {
		this.messagingManagerService.loadAllChatRooms();
	}





	public async createNewChatRoom() {
		if (this.chatNameInput && this.chatNameInput.nativeElement) {
			const chatName = this.chatNameInput.nativeElement.value.trim();
			if (chatName) {
				await this.messagingManagerService.createNewChatRoom(chatName);
				this.chatNameInput.nativeElement.value = '';
			} else {
				// TODO notification "Le nom du chat doit être remplis"
			}
		} else {
			console.error("messageInput n'est pas défini.");
		}
	}

	async onKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			await this.createNewChatRoom();
		}
	}
}
