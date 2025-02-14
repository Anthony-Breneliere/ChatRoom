import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { NgIconComponent, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { saxCardsBulk, saxBuildingsBulk } from '@ng-icons/iconsax/bulk';
import { bootstrapArrowDown, bootstrapArrowUp } from '@ng-icons/bootstrap-icons';

import { User } from 'src/app/_common/models/user.model';
import { AccountService } from 'src/app/_common/services/account/account.service';

import { ChatButtonGroupComponent } from '../../_common/components/chat-button-group/chat-button-group.component';
import { MHPButton } from 'src/app/_common/components/chat-button-group/chat-button.interface';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { SITEMAP } from 'src/app/_common/sitemap';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatSvgIconComponent } from '../../_common/components/chat-svg-icon/chat-svg-icon.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainChatRoomComponent } from "../main-chat-room/main-chat-room.component";
import { ChatMessage } from 'src/app/_common/models/chat-message.model';

@Component({
	selector: 'app-main-dashboard',
	standalone: true,
	imports: [
    CommonModule,
    RouterModule,
    NgIconComponent,
    ChatButtonGroupComponent,
    ChatButtonComponent,
    ChatSvgIconComponent,
    FormsModule,
    MainChatRoomComponent
],
	providers: [
		provideIcons({
			bootstrapArrowUp,
			bootstrapArrowDown,
			saxCardsBulk,
			saxBuildingsBulk,
		}),
		provideNgIconsConfig({ size: '1.5rem' }),
	],
	styleUrl: './main-dashboard.component.scss',
	templateUrl: './main-dashboard.component.html',
})
export class MainDashboardComponent implements OnInit {

	private readonly _accountSvc = inject(AccountService);

	private readonly _messagingSvc = inject(MessagingService);

	public readonly sitemap = SITEMAP;

	public readonly user = computed<User | null>(this._accountSvc.user);

	public readonly joinedChatRoomsButtons : WritableSignal<MHPButton<ChatRoom>[]> = signal<MHPButton<ChatRoom>[]>([]);
	public roomSelected : WritableSignal<ChatRoom | null> = signal<ChatRoom | null>(null);

	chatRooms :  WritableSignal<ChatRoom[]> = signal<ChatRoom[]>([]);
	@ViewChild('createChatRoomName') createChatRoomName !: ElementRef;
 
	@ViewChild('messageInput') messageInput !: ElementRef;



	constructor() {}

	ngOnInit(): void {
		this._messagingSvc.getRooms()
			.then(rooms => this.chatRooms.set(rooms))
			.then(() => {
				this.chatRooms().forEach(room => {
					if(room.participants.some(participant => participant.id === this.user()!.id)) {
						this.createJoinedChatRoomsButtons(room);
					}
				})

				this.joinedChatRoomsButtons().forEach(button => {
					this._messagingSvc.InitConnexionAndGetMessages(button.value.id).then(messages => {
						button.value.messages = messages;
					});
				});

			});
		
		this._messagingSvc.getChatRoomsCreated().subscribe((newChatRoom) => {
			this.chatRooms.update(rooms => [...rooms, newChatRoom]);
			
			if(newChatRoom.participants.some(participant => participant.id === this.user()!.id)) {
				this.createJoinedChatRoomsButtons(newChatRoom);
			}
		});

		this._messagingSvc.getChatRoomsDeleted().subscribe((DeletedChatRoomId) => {
			this.chatRooms.update(rooms => rooms.filter(room => room.id !== DeletedChatRoomId));
			this.deleteJoinedChatRoomsButtons(DeletedChatRoomId);
		});

		this._messagingSvc.getNewJoiners().subscribe((room) => {
			this.joinedChatRoomsButtons.update(buttons => {
				buttons[buttons.findIndex(button => button.value.id === room.id)].value.participants = room.participants;
				return buttons
			});
		});

		this._messagingSvc.getNewMessage().subscribe((message) => {
			this.joinedChatRoomsButtons.update(buttons => {
				buttons[buttons.findIndex(button => button.value.id === message.roomId)].value.messages.push(message);
				return buttons
			});
		});

	}

	async createRoom() {
		await this._messagingSvc.createChatRoom(this.createChatRoomName.nativeElement.value);
		this.createChatRoomName.nativeElement.value = "";
	}

	async DeleteRoom(roomId : string) {
		await this._messagingSvc.deleteChatRoom(roomId);
	}

	async JoinRoom(room : ChatRoom) {
		this._messagingSvc.joinChatRoom(room.id, this.user()!.id).then(messages => {
			room.messages = messages;
		});
		this.createJoinedChatRoomsButtons(room);

		this.joinedChatRoomsButtons.update(buttons => {
			buttons[buttons.findIndex(button => button.value.id === room.id)].value.participants.push(this.user()!);
			return buttons
		});
	}

	private async createJoinedChatRoomsButtons(room : ChatRoom) {
		if(!this.joinedChatRoomsButtons().some(button => button.value.id === room.id)) {
			this.joinedChatRoomsButtons.update(buttons => [...buttons, {text: room.name, value: room}]);
		}
		
	}

	private async deleteJoinedChatRoomsButtons(roomId : string) {
		this.joinedChatRoomsButtons.update(buttons => buttons.filter(button => button.value.id !== roomId));
	}

	public isJoined(roomId: string): boolean {
		return this.joinedChatRoomsButtons().some(button => button.value.id === roomId).valueOf();
	}

	public async sendMessage(roomId: string) {
		await this._messagingSvc.sendMessage(roomId, this.messageInput.nativeElement.value);
		this.messageInput.nativeElement.value = "";
	}

}

