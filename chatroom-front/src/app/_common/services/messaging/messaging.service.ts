import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Observable, Subject, switchMap } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	private chatroomsSubject = new Subject<ChatRoom>();
	private messagesSubject = new Subject<ChatMessage>();
	public chatrooms$ = this.chatroomsSubject.asObservable();
	public messages$ = this.messagesSubject.asObservable();

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

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
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
	 * @returns chatroom[]
	 */
	public async getRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('GetRooms');
	}

	public async deleteChatroom(roomId : string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('DeleteChatroom', roomId);
	}

	public async deleteMessage(messageId : string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('DeleteMessage', messageId);
	}

	public async updateMessage(messageId : string, content: string): Promise<void> {
		await this.getConnectionPromise;
		await this._hubConnection.invoke('EditedMessage', messageId, content);
	}

	public getRoomsAsObservable(): Observable<ChatRoom> {
		return this.chatroomsSubject.asObservable();
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
}
