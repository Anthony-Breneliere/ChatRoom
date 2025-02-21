import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Subject, Observable } from 'rxjs';
import { UserDto } from '../../dto/user.dto';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
	private newMessageSubject = new Subject<ChatMessage>();
	private editedMessageSubject = new Subject<ChatMessage>();
	private deletedMessageSubject = new Subject<ChatMessage>();
	private userWritingSubject = new Subject<ChatMessage>();
	private newChatRoomSubject = new Subject<ChatRoom>();
	private userJoinedSubject = new Subject<{ roomId: string; user: UserDto }>();
	private userLeftSubject = new Subject<{ roomId: string; user: UserDto }>();
	private userStartedTypingSubject = new Subject<{ roomId: string; user: UserDto }>();
	private userStoppedTypingSubject = new Subject<{ roomId: string; user: UserDto }>();

	public newMessage$: Observable<ChatMessage> = this.newMessageSubject.asObservable();
	public editedMessage$: Observable<ChatMessage> = this.editedMessageSubject.asObservable();
	public deletedMessage$: Observable<ChatMessage> = this.deletedMessageSubject.asObservable();
	public userWriting$: Observable<ChatMessage> = this.userWritingSubject.asObservable();
	public newChatRoom$: Observable<ChatRoom> = this.newChatRoomSubject.asObservable();
	public userJoined$: Observable<{ roomId: string; user: UserDto }> = this.userJoinedSubject.asObservable();
	public userLeft$: Observable<{ roomId: string; user: UserDto }> = this.userLeftSubject.asObservable();
	public userStartedTyping$: Observable<{ roomId: string; user: UserDto }> = this.userStartedTypingSubject.asObservable();
	public userStoppedTyping$: Observable<{ roomId: string; user: UserDto }> = this.userStoppedTypingSubject.asObservable();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			this.newMessageSubject.next(message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
			this.editedMessageSubject.next(message);
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
			this.deletedMessageSubject.next(message);
		});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
			this.userWritingSubject.next(user);
		});

		this._hubConnection.on('NewChatRoom', (room: ChatRoom) => {
			this.newChatRoomSubject.next(room);
		});

		this._hubConnection.on('UserJoined', (roomId: string, user: UserDto) => {
			this.userJoinedSubject.next({ roomId, user });
		});

		this._hubConnection.on('UserLeft', (roomId: string, user: UserDto) => {
			this.userLeftSubject.next({ roomId, user });
		});

		this._hubConnection.on('UserTyping', (roomId: string, user: UserDto) => {
			this.userStartedTypingSubject.next({ roomId, user });
		});

		this._hubConnection.on('UserStoppedTyping', (roomId: string, user: UserDto) => {
			this.userStoppedTypingSubject.next({ roomId, user });
		});
	}

	/**
	 * Get a chat room for the offer provided
	 * @param roomId
	 * @returns chatroom
	 */
	public async getChatRoom(roomId: string): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('GetChatRoom', roomId);
	}

	/**
	 * Create a new chat room
	 */
	public async createChatRoom(name: string): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', name);
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
	}

	/**
	 * Get all chat room messages
	 */
	public async leaveChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('LeaveChatRoom', roomId);
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendMessage', roomId, message);
	}

	/**
	 * Get all chat rooms
	 */
	public async getChatRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('GetChatRooms');
	}

	/**
	 * Edit a message
	 */
	public async editMessage(roomId: string, messageId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('EditMessage', roomId, messageId, message);
	}

	/**
	 * Indicate that the user is typing
	 */
	public async notifyTyping(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('NotifyTyping', roomId);
	}

	/**
	 * Indicate that the user has stopped typing
	 */
	public async notifyStoppedTyping(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('NotifyStoppedTyping', roomId);
	}
}
