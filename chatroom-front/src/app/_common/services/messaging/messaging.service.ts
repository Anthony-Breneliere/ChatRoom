import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('New message received:', message);

			//TODO

		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
		});
	}

	/**
	 * Get a chat room for the offer provided, create a new one if it doesn't exist
	 * @param offerId
	 * @returns
	 */
	public async getOrCreateChatRoomFromOffer(offerId: string): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('GetChatRoomFromOffer', offerId);
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		const chatHistory = await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
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
