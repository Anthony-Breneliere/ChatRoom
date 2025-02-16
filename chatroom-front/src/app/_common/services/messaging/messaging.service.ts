import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { ChatMessage } from '../../models/chat-message.model';
import { User } from '../../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
	messages = signal<ChatMessage[]>([])
	rooms = signal<ChatRoom[]>([])
	joinedRooms = signal<ChatRoom[]>([])

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('New message received:', message);
			this.handleReceivedMessage(message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('NewChatRoom', (newRoom: ChatRoom) => {
			console.log("new room")
			console.log(newRoom)
			this.rooms.update(old => [...old, newRoom])
		});

		this._hubConnection.on('EditedChatRoom', (newRoom: ChatRoom) => {
			console.log("edited room")
			console.log(newRoom)
			const oldRoom = this.rooms().find(room => room.id === newRoom.id)
			if (oldRoom) {
				oldRoom.participants = newRoom.participants
			}
		});

		this._hubConnection.on('UserWriting', (room: ChatRoom, user: User) => {
			this.handleReceivedUserWriting(room, user)
		});

		this._hubConnection.on('UserWriting', (user: User, room: ChatRoom) => {
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
	public async createChatRoom( name: string ): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', name);
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string): Promise<void> {
		if (this.joinedRooms().find(room => room.id === roomId)) {
			return;
		}

		console.log('Joining room: ', roomId);
		await this.getConnectionPromise;

		const chatHistory = await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
		const joinedRoom = this.rooms().find(room => room.id === roomId)!
		if (!joinedRoom) {
			throw new Error(`Room ${roomId} not found`)
		}

		joinedRoom.messages = chatHistory
		this.joinedRooms.set([...this.joinedRooms(), joinedRoom])
	}

	/**
	 * Leave room
	 */
	public async leaveChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('LeaveChatRoom', roomId);
		this.joinedRooms.set(this.joinedRooms().filter(room => room.id !== roomId))
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendMessage', roomId, message);
	}

	public async sendUserWriting(roomId: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendUserWriting', roomId);
	}

	/**
	 * Get chat room list
	 */
	public async listChatRoom(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('ListChatRoom');
	}

	private async handleReceivedMessage(message: ChatMessage) {
		console.log(message)
		const concernedRoom = this.joinedRooms().find(room => room.id === message.roomId)
		if (concernedRoom) {
			concernedRoom.messages.push(message)
		}
	}

	private async handleReceivedUserWriting(chatRoom: ChatRoom, user: User) {
		const concernedRoom = this.joinedRooms().find(room => room.id === chatRoom.id)
		if (concernedRoom) {
			concernedRoom.userWriting = user
			setTimeout(() => {
				concernedRoom.userWriting = undefined
			}, 1000);
		}
	}
}
