import { Component, computed, inject } from '@angular/core';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { saxCardsBulk, saxBuildingsBulk } from '@ng-icons/iconsax/bulk';
import { bootstrapArrowDown, bootstrapArrowUp } from '@ng-icons/bootstrap-icons';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/_common/models/user.model';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { take as rxjsTake } from 'rxjs/operators';
import { ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent, CommonModule, FormsModule],
	providers: [
		provideIcons({
			bootstrapArrowUp,
			bootstrapArrowDown,
			saxCardsBulk,
			saxBuildingsBulk,
		}),
		provideNgIconsConfig({ size: '1.5rem' }),
	],
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {
private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
	public chatRooms: ChatRoom[] = [];
	public participantsName = {} as Record<string, string[]>;
	public selectedRooms: ChatRoom[] = [];
	public newUserName: string = '';
	public newRoomName: string = '';

	public openModal: boolean = false;
	public currentRoomForModal: ChatRoom | null = null;

	private newMessageSubscription: Subscription = new Subscription();
	private newChatRoomSubscription: Subscription = new Subscription();
	private newUserInChatRoomSubscription: Subscription = new Subscription();
	private newUserLeavedChatRoomSubscription: Subscription = new Subscription();
	private newUserWhoLeftChatRoomSubscription: Subscription = new Subscription();
	private newUserWhoChangedNameSubscription: Subscription = new Subscription();
	private newUserIdWhoChangedNameSubscription: Subscription = new Subscription();
	private newUserWhoIsWritingSubscription: Subscription = new Subscription();
	private newUserWhoIsWritingRoomSubscription: Subscription = new Subscription();

	@ViewChildren('messageContainer') messageContainers!: QueryList<ElementRef>;

	constructor(private messagingService: MessagingService) {}

	ngOnInit(): void {
	  this.loadChatRooms();
	  this.newMessageSubscription = this.messagingService.newMessage$.subscribe((message: ChatMessage) => {
		if (this.selectedRooms) {
			this.selectedRooms.forEach(room => {
				if (room.id === message.roomId) {
					room.messages.push(message);
				}
			});
		}
	  });
		this.newChatRoomSubscription = this.messagingService.newChatRoom$.subscribe((room: ChatRoom) => {
			this.chatRooms.push(room);
			this.setParticipantsNamesByRoomId(room.id, room.participants.map(participant => participant.firstName?.toString() || ''));
		});
		this.newUserInChatRoomSubscription = this.messagingService.newUserInChatRoom$.subscribe((chatroom: ChatRoom) => {
			this.participantsName[chatroom.id] = chatroom.participants.map(participant => participant.firstName?.toString() || '');
			
			if (this.currentRoomForModal && this.currentRoomForModal.id === chatroom.id) {
				this.currentRoomForModal.participants = chatroom.participants;
			}

			this.selectedRooms?.forEach(room => {
				if (room.id === chatroom.id) {
					var newMessage: ChatMessage = {
						id: '',
						roomId: chatroom.id,
						authorFullName: "",
						authorId: '',
						authorCompanyId: 0,
						authorCompanyName: '',
						content: `${chatroom.participants[chatroom.participants.length - 1].firstName} joined the chat room`,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
					room.messages.push(newMessage);
				}
			});
		});
		this.newUserLeavedChatRoomSubscription = this.messagingService.newUserLeavedChatRoom$.subscribe((chatroom: ChatRoom) => {
			this.participantsName[chatroom.id] = this.participantsName[chatroom.id].filter(name => 
				chatroom.participants.some(participant => participant.firstName === name)
			);

			if (this.currentRoomForModal && this.currentRoomForModal.id === chatroom.id) {
				this.currentRoomForModal.participants = chatroom.participants;
			}
			
			this.newUserWhoLeftChatRoomSubscription = this.messagingService.UserWhoLeftChatRoom$.subscribe((username: String) => {
				this.selectedRooms?.forEach(room => {
					if (room.id === chatroom.id) {
						var newMessage: ChatMessage = {
							id: '',
							roomId: chatroom.id,
							authorFullName: "",
							authorId: '',
							authorCompanyId: 0,
							authorCompanyName: '',
							content: `${username} left the chat room`,
							createdAt: new Date(),
							updatedAt: new Date(),
						};
						room.messages.push(newMessage);
					}
				});
			});
		});
		this.newUserWhoChangedNameSubscription = this.messagingService.UserWhoChangedName$.subscribe((username: String) => {
			
		});
		this.newUserWhoIsWritingSubscription = this.messagingService.UserWhoIsWriting$.subscribe((user: User) => {
			if (user.id === this.user()?.id) {
				return;
			}
			this.messagingService.UserWhoIsWritingRoom$.pipe(rxjsTake(1)).subscribe((roomId: String) => {
				this.changeisWriting(roomId as string, user, true);
				setTimeout(() => {
					this.changeisWriting(roomId as string, user, false);
				}, 4000);
			});
		});
	}

	ngOnDestroy(): void {
		if (this.newMessageSubscription) {
			this.newMessageSubscription.unsubscribe();
		}
		if (this.newUserWhoChangedNameSubscription) {
			this.newUserWhoChangedNameSubscription.unsubscribe();
		}
		if (this.newUserWhoIsWritingSubscription) {
			this.newUserWhoIsWritingSubscription.unsubscribe();
		}
		if (this.newUserWhoIsWritingRoomSubscription) {
			this.newUserWhoIsWritingRoomSubscription.unsubscribe();
		}
	}

	ngAfterViewChecked() {
		this.scrollToBottom();
	}

	private loadChatRooms() {
		this.messagingService.getChatRooms().then((rooms) => {
			this.chatRooms = rooms;
			this.loadChatRoomsMessages(rooms);
			rooms.forEach((room, index) => {
				room.users_writings = [];
				room.participants.forEach(participant => {
					if (participant.id === this.user()?.id) {
						this.selectedRooms.push(room);
						this.joinRoom(room.id);
					}
					if (!this.participantsName[room.id]) {
						this.participantsName[room.id] = [];
					}
					this.participantsName[room.id].push(participant.firstName?.toString() || '');
				});
			});
		}).catch(error => {
			console.error('Error fetching chat rooms:', error);
		});
	}

	private loadChatRoomsMessages(rooms: ChatRoom[]): void {
		this.messagingService.getChatRoomsMessages(rooms.map(room => room.id)).then((messages: Record<string, ChatMessage[]>) => {
			rooms.forEach((room, index) => {
				room.messages = messages[room.id] || [];
			});
		});
	}

	public createChatRoom(newRoomName: string): void {
		if (newRoomName === '') {
			return;
		}
		this.messagingService.createChatRoom(newRoomName).then((newRoom) => {
			if (this.selectedRooms!.find(selectedRoom => selectedRoom.id === newRoom.id)) {
				return;
			}
			this.joinRoom(newRoom.id);
			this.selectedRooms!.push(newRoom);
		}).catch(error => {
			console.error('Error creating chat room:', error);
		});
	};

	public getParticipantsNamesByRoomId(roomId: string): string[] {
		return this.participantsName[roomId] || [];
	}

	public setParticipantsNamesByRoomId(roomId: string, names: string[]): void {
		this.participantsName[roomId] = names;
	}

	selectRoom(room: ChatRoom): void {
		if (this.selectedRooms!.find(selectedRoom => selectedRoom.id === room.id)) {
			return;
		}
		this.selectedRooms!.push(room);
		room.users_writings = [];
		this.joinRoom(room.id);
	}

	joinRoom(roomId: string): void {
		this.messagingService.joinChatRoom(roomId).then(messages => {
			this.selectedRooms?.forEach(room => {
				if (room.id === roomId) {
					room.messages = messages;
				}
			});
		});
	}

	leaveRoom(room: ChatRoom): void {
		this.messagingService.leaveChatRoom(room.id).then(() => {
			this.selectedRooms = this.selectedRooms.filter(selectedRoom => selectedRoom.id !== room.id);
		});
	}

	sendMessage(room: ChatRoom): void {
		if (room) {
			if (room.newMessage === '') {
				return;
			}
			this.messagingService.sendMessage(room.id, room.newMessage)
			room.newMessage = '';
		}
	}

	ChangeUserName(newUserName: string): void {
		if (newUserName === '') {
			return;
		}
		this.messagingService.ChangeUserName(newUserName);
		this.user()!.firstName = newUserName;
		this._accountSvc.updateAccount(this.user()!);
	}

	openModalWindow(room: ChatRoom) {
		this.openModal = true;
		this.currentRoomForModal = room;
	}

	closeModalWindow(room: ChatRoom) {
		this.openModal = false;
		this.currentRoomForModal = null;
	}
	
	onUserTyping(roomId: string): void {
		this.messagingService.UserIsWriting(roomId);
	}

	changeisWriting(roomId: string, user: User, isWriting: boolean): void {
		if (user.id === this.user()!.id) return;
	
		this.selectedRooms?.forEach(room => {
			if (room.id !== roomId) return;

			if (!room.users_writings) {
				room.users_writings = [];
			}
	
			if (isWriting) {
				if (!room.users_writings.includes(user.firstName)) {
					room.users_writings.push(user.firstName);
				}
			} else {
				room.users_writings = room.users_writings.filter(firstName => firstName !== user.firstName);
			}
	
			const writersCount = room.users_writings.length;
			room.user_is_writing = writersCount > 0;
	
			if (writersCount === 0) {
				room.user_writing_message = '';
				room.user_is_writing = false;
			} else if (writersCount === 1) {
				room.user_writing_message = `${room.users_writings[0]} is writing...`;
			} else {
				room.user_writing_message = `${room.users_writings[0]} and ${writersCount - 1} more are writing...`;
			}
		});
	}

	private scrollToBottom(): void {
		try {
		  this.messageContainers.forEach(container => {
			container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
		  });
		} catch (err) { }
	  }
}
