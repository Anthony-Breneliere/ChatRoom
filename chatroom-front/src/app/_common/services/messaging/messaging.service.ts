import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { filter, map, Observable, ObservableInput, Subject, switchMap } from 'rxjs';

type EnterOrLeaveChatRoom = {
	id: string,
	username: string,
	userId: string,
}

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	// Subjects for managing different chat-related events
	private chatroomsSubject = new Subject<ChatRoom>();
	private messagesSubject = new Subject<ChatMessage>();
	private userWrittingSubject = new Subject<string>();

	// Subjects for user entry and exit in chat rooms
	private userLeaveChatRoomSubject = new Subject<EnterOrLeaveChatRoom>();
	private userEnterChatRoomSubject = new Subject<EnterOrLeaveChatRoom>();

	// Public observables to allow subscription without direct modification
	public userLeaveChatRoom$ = this.userLeaveChatRoomSubject.asObservable();
	public userEnterChatRoom$ = this.userEnterChatRoomSubject.asObservable();
	public chatrooms$ = this.chatroomsSubject.asObservable();
	public messages$ = this.messagesSubject.asObservable();
	public userWritting$ = this.userWrittingSubject.asObservable();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('NewMessage received:', message);
			this.messagesSubject.next(message);
		});

		this._hubConnection.on('NewChatroom', (chatroom: ChatRoom) => {
			console.log('NewChatroom received:', chatroom.id);
			this.chatroomsSubject.next(chatroom);
		});

		this._hubConnection.on('DeletedChatroom', (chatroom: ChatRoom) => {
			console.log('DeleteChatroom received:', chatroom);
			this.chatroomsSubject.next(chatroom);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
			console.log('EditedMessage received:', message);
			this.messagesSubject.next(message);
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
			console.log('DeletedMessage received:', message);
			this.messagesSubject.next(message);
		});

		this._hubConnection.on('SomeoneIsWritting', (roomId: string, userFulleName: string) => {
			console.log("SomeoneIsWritting : ", userFulleName);
			this.userWrittingSubject.next(userFulleName);
		});

		this._hubConnection.on('LeaveChatRoom', (roomId: string, userFulleName: string, userId: string) => {
			console.log("LeaveChatRoom : ", roomId, userFulleName, userId);
			this.userLeaveChatRoomSubject.next({ id : roomId, username: userFulleName, userId: userId});
		});

		this._hubConnection.on('EnterChatRoom', (roomId: string, userFulleName: string, userId: string) => {
			console.log("EnterChatRoom : ", roomId, userFulleName, userId);
			this.userEnterChatRoomSubject.next({ id : roomId, username: userFulleName, userId: userId});
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
	 *
	 * @returns Get all the chatrooms
	 */
	public async getRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatRoom[]>('GetRooms');
	}

	/**
	 *
	 * @param roomId id of the room we want to delete
	 */
	public async deleteChatroom(roomId : string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('DeleteChatroom', roomId);
	}

	/**
	 *
	 * @param messageId id of the message we want to delete
	 */
	public async deleteMessage(messageId : string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('DeleteMessage', messageId);
	}

	/**
	 *
	 * @param messageId id of message
	 * @param content content of the edited message we want to update
	 */
	public async updateMessage(messageId : string, content: string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('EditedMessage', messageId, content);
	}

	/**
	 *
	 * @param roomId Id of the room where someone is writtig
	 * @param fullName The we want to show to other person on the room
	 */
	public async someoneIsWritting(roomId: string, fullName: string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('SomeoneIsWritting', roomId, fullName);
	}


	/**
	 * Observable + filter on roomId
	 */
	public getUserLeaveChatroomAsObservable(roomId: string): Observable<EnterOrLeaveChatRoom> {
		return this.userLeaveChatRoom$.pipe(
			filter(obj => obj.id == roomId)
		)
	}

	/**
	 * Observable + filter on roomId
	 */
	public getUserEnterChatroomAsObservable(roomId: string): Observable<EnterOrLeaveChatRoom> {
		return this.userEnterChatRoom$.pipe(
			filter(obj => obj.id == roomId)
		)
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
	public async joinChatRoom(roomId: string, userId: string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId, userId);
	}

	/**
	 * Get all chat room messages
	 */
	public async leaveChatRoom(roomId: string, userId: string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('LeaveChatRoom', roomId, userId);
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('SendMessage', roomId, message);
	}
}
