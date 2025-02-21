import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Subject } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
    private newMessageSubject = new Subject<ChatMessage>();
    public newMessage$ = this.newMessageSubject.asObservable();

	private newChatRoomSubject = new Subject<ChatRoom>();
	public newChatRoom$ = this.newChatRoomSubject.asObservable();

	private newUserInChatRoomSubject = new Subject<ChatRoom>();
	public newUserInChatRoom$ = this.newUserInChatRoomSubject.asObservable();
	private newUserLeavedChatRoomSubject = new Subject<ChatRoom>();
	public newUserLeavedChatRoom$ = this.newUserLeavedChatRoomSubject.asObservable();
	public UserWhoLeftChatRoomSubject = new Subject<String>();
	public UserWhoLeftChatRoom$ = this.UserWhoLeftChatRoomSubject.asObservable();
	public UserWhoChangedNameSubject = new Subject<String>();
	public UserWhoChangedName$ = this.UserWhoChangedNameSubject.asObservable();
	public UserIdWhoChangedNameSubject = new Subject<String>();
	public UserIdWhoChangedName$ = this.UserIdWhoChangedNameSubject.asObservable();

	public UserWhoIsWritingSubject = new Subject<User>();
	public UserWhoIsWriting$ = this.UserWhoIsWritingSubject.asObservable();
	public UserWhoIsWritingRoomSubject = new Subject<String>();
	public UserWhoIsWritingRoom$ = this.UserWhoIsWritingRoomSubject.asObservable();
	public UserWhoStoppedWritingSubject = new Subject<User>();
	public UserWhoStoppedWriting$ = this.UserWhoStoppedWritingSubject.asObservable();
	public UserWhoStoppedWritingRoomSubject = new Subject<String>();
	public UserWhoStoppedWritingRoom$ = this.UserWhoStoppedWritingRoomSubject.asObservable();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			this.newMessageSubject.next(message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('UserIsWriting', (user: User, roomId: String) => {
			this.UserWhoIsWritingSubject.next(user);
			this.UserWhoIsWritingRoomSubject.next(roomId);
		});

		this._hubConnection.on('NewChatRoom', (chatroom: ChatRoom) => {
			this.newChatRoomSubject.next(chatroom);
		});

		this._hubConnection.on('UserJoinedRoom', (chatroom: ChatRoom) => {
			this.newUserInChatRoomSubject.next(chatroom);
		});
		this._hubConnection.on('UserLeftRoom', (chatroom: ChatRoom, username: string) => {
			this.newUserLeavedChatRoomSubject.next(chatroom);
			this.UserWhoLeftChatRoomSubject.next(username);
		});

		this._hubConnection.on('UserChangedName', (userId: string, username: string) => {
			this.UserWhoChangedNameSubject.next(username);
			this.UserIdWhoChangedNameSubject.next(userId);
		});
	}

	/**
	 * Get all chat rooms
	 * @returns chatrooms
	 */
	public async getChatRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('GetChatRooms');
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
	public async createChatRoom(newRoomName: string): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', newRoomName);
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
	}

	public async getChatRoomsMessages(roomIds: string[]): Promise<Record<string, ChatMessage[]>> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<Record<string, ChatMessage[]>>('GetChatRoomsMessages', roomIds);
	}

	/**
	 * Leave chat room
	 */
	public async leaveChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('LeaveChatRoom', roomId);
	}

	/**
	 * Leave chat rooms
	 */
		public async leaveChatRooms(): Promise<void> {
			await this.getConnectionPromise;
	
			await this._hubConnection.invoke('LeaveChatRooms');
		}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke('SendMessage', roomId, message);
	}

	/**
	 * Change the user's name
	 */
	public async ChangeUserName(userName: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('ChangeUsername', userName);
	}

	/**
	 * Notify that the user is writing a message
	 */
	public async UserIsWriting(roomId: string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('UserIsWriting', roomId);
	}
}
