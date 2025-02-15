import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	private newMessageSubject = new Subject<ChatMessage>();
	private editedMessageSubject = new Subject<ChatMessage>();
	private deletedMessageSubject = new Subject<ChatMessage>();
	private userWritingSubject = new Subject<ChatMessage>();


	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			this.newMessageSubject.next(message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
			this.editedMessageSubject.next(message);
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
			this.deletedMessageSubject.next(message)
		});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
			this.userWritingSubject.next(user)
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
	 * Get all ChatsRooms
	 * @returns chatroom
	 */
	public async getAllChatRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatRoom[]>('GetAllChatRooms');
	}



	/**
	 * Create a new chat room
	 */
	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
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


	/* Observables */
	public onNewMessage(): Observable<ChatMessage> {
		return this.newMessageSubject.asObservable();
	}

	public onEditedMessage(): Observable<ChatMessage> {
		return this.editedMessageSubject.asObservable();
	}

	public onDeletedMessage(): Observable<ChatMessage> {
		return this.deletedMessageSubject.asObservable();
	}

	public onUserWriting(): Observable<ChatMessage> {
		return this.userWritingSubject.asObservable();
	}
}
