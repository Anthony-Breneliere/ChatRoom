import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
	messages = signal<ChatMessage[]>([])
	rooms = signal<ChatRoom[]>([])
	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('New message received:', message);
			this.messages.update(old => [...old, message])
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('NewChatRoom', (newRoom: ChatRoom) => {
			console.log(newRoom)
			this.rooms.update(old => [...old, newRoom])
		});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
		});

		this.listChatRoom().then((res) => this.rooms.set(res))
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
	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		const chatHistory = await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
		this.messages.set(chatHistory)
	}

	/**
	 * Leave room
	 */
	public async leaveChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('LeaveChatRoom', roomId);
		this.messages.set([])
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendMessage', roomId, message);
	}

	/**
	 * Get chat room list
	 */
	public async listChatRoom(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('ListChatRoom');
	}
}
