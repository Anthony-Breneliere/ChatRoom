import { Component, Input, signal, inject, computed, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { filter, debounceTime, of, Subscription } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { User } from 'src/app/_common/models/user.model';
import { MainChatMessageComponent } from './main-chat-message/main-chat-message.component';
import { UserDto } from 'src/app/_common/dto/user.dto';
import cryptojs from 'crypto-js';

@Component({
	selector: 'app-main-chat-room',
	standalone: true,
	templateUrl: './main-chat-room.component.html',
	imports: [MainChatMessageComponent, ReactiveFormsModule],
	providers: [MessagingService],
})
export class MainChatRoomComponent implements OnDestroy {
	@Input() roomId!: string;
	@Input() onChatRoomLeave?: Function;

	private _accountSvc = inject(AccountService);

	user = computed<User | null>(this._accountSvc.user);

	open = signal(true);
	room = signal<ChatRoom | null>(null);
	participants = signal<Map<string, UserDto>>(new Map());
	messages = signal<ChatMessage[]>([]);
	editMessage = signal<ChatMessage | null>(null);
	public typingUsers = signal<UserDto[]>([]);
	view = signal<'messages' | 'participants'>('messages');

	messageToSend = new FormControl('');

	private _subscriptions = new Subscription();
	private typingTimeout: any;

	@ViewChild('messagesContainer') private messagesContainer: ElementRef | null = null;

	constructor(private messagingService: MessagingService) {}

	async ngOnInit() {
		const history = await this.messagingService.joinChatRoom(this.roomId);
		this.messages.set(history);

		const room = await this.messagingService.getChatRoom(this.roomId);
		console.log('room', room);
		this.room.set(room);
		this.participants.update(participants => {
			room.participants.forEach(participant => {
				participants.set(participant.id, participant);
			});

			return participants;
		});

		this._subscriptions.add(
			this.messagingService.newMessage$.pipe(filter(message => message.roomId === this.roomId)).subscribe(message => {
				this.messages.update(messages => {
					messages.push(message);

					return messages;
				});

				const scrollDifference = Math.abs(
					this.messagesContainer?.nativeElement.scrollHeight -
						this.messagesContainer?.nativeElement.scrollTop -
						this.messagesContainer?.nativeElement.clientHeight
				);

				if (message.authorId === this.user()?.id || scrollDifference < 100) {
					window.setTimeout(() => this.scrollToBottom(true), 0);
				}
			})
		);

		this._subscriptions.add(
			this.messagingService.editedMessage$
				.pipe(filter(message => message.roomId === this.roomId))
				.subscribe(editedMessage => {
					this.messages.update(messages => {
						const index = messages.findIndex(message => message.id === editedMessage.id);

						if (index === -1) {
							return messages;
						}

						messages[index] = editedMessage;

						return messages;
					});
				})
		);

		this._subscriptions.add(
			this.messageToSend.valueChanges.subscribe(value => {
				if (!value) {
					this.editMessage.set(null);
				}
			})
		);

		this._subscriptions.add(
			this.messagingService.userJoined$.pipe(filter(({ roomId }) => roomId === this.roomId)).subscribe(({ user }) => {
				this.participants.update(participants => {
					participants.set(user.id, user);

					return participants;
				});

				this.messages.update(messages => {
					messages.push({
						id: crypto.randomUUID(),
						content: `${user.email!.split('@')[0]} a rejoint le salon`,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						isSystemMessage: true,
					} as unknown as ChatMessage);

					return messages;
				});

				window.setTimeout(() => this.scrollToBottom(true), 0);
			})
		);

		this._subscriptions.add(
			this.messagingService.userLeft$.pipe(filter(({ roomId }) => roomId === this.roomId)).subscribe(({ user }) => {
				this.participants.update(participants => {
					if (!participants.has(user.id)) {
						return participants;
					}

					participants.delete(user.id);

					return participants;
				});

				this.messages.update(messages => {
					messages.push({
						id: crypto.randomUUID(),
						content: `${user.email!.split('@')[0]} a quitté le salon`,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						isSystemMessage: true,
					} as unknown as ChatMessage);

					return messages;
				});

				window.setTimeout(() => this.scrollToBottom(true), 0);
			})
		);

		this._subscriptions.add(
			this.messagingService.userStartedTyping$
				.pipe(filter(({ roomId }) => roomId === this.roomId))
				.subscribe(({ user }) => {
					this.typingUsers.update(users => {
						users.push(user);

						return users;
					});
				})
		);

		this._subscriptions.add(
			this.messagingService.userStoppedTyping$
				.pipe(filter(({ roomId }) => roomId === this.roomId))
				.subscribe(({ user }) => {
					this.typingUsers.update(users => {
						const index = users.findIndex(u => u.id === user.id);

						if (index === -1) {
							return users;
						}

						users.splice(index, 1);

						return users;
					});
				})
		);

		this._subscriptions.add(
			this.messageToSend.valueChanges
				.pipe(
					debounceTime(300),
					filter(value => !!value)
				)
				.subscribe(() => {
					if (this.typingTimeout) {
						clearTimeout(this.typingTimeout);
					}

					this.typingTimeout = setTimeout(() => {
						this.messagingService.notifyStoppedTyping(this.roomId);
					}, 10_000);

					if (this.typingUsers().find(user => user.id === this.user()?.id)) {
						return;
					}

					this.messagingService.notifyTyping(this.roomId);
				})
		);

		window.setTimeout(() => this.scrollToBottom(), 0);
	}

	scrollToBottom(smooth = false) {
		this.messagesContainer?.nativeElement.scroll({
			top: this.messagesContainer.nativeElement.scrollHeight,
			left: 0,
			behavior: smooth ? 'smooth' : 'auto',
		});
	}

	ngOnDestroy() {
		this._subscriptions.unsubscribe();
	}

	sendMessage(event: SubmitEvent) {
		const message = this.messageToSend.value;

		if (message) {
			of(message)
				.pipe(
					debounceTime(300),
					filter(message => message.trim().length > 0)
				)
				.subscribe(async message => {
					if (this.editMessage()) {
						await this.messagingService.editMessage(this.roomId, this.editMessage()!.id, message);
					} else {
						await this.messagingService.sendMessage(this.roomId, message);
					}

					this.messageToSend.reset();

					if (this.typingTimeout) {
						clearTimeout(this.typingTimeout);
					}
				});
		}

		event.preventDefault();
	}

	toggleOpen() {
		this.open.update(open => !open);
	}

	async leave() {
		this.onChatRoomLeave?.();

		await this.messagingService.leaveChatRoom(this.roomId);
	}

	onEditMessage(message: ChatMessage) {
		this.editMessage.set(message);
		this.messageToSend.setValue(message.content);
	}

	getTypingUsers() {
		return this.typingUsers().filter(user => user.id !== this.user()?.id);
	}

	public getGravatarUrl(email: string, size: number = 64): string {
		const trimmedEmail: string = email.trim().toLowerCase();
		const hash: string = cryptojs.SHA256(trimmedEmail).toString();

		return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
	}
}
