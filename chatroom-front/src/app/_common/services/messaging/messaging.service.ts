import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Observable, Subject } from 'rxjs';
import { UserDto } from '../../dto/user.dto';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	private chatRoomsCreated = new Subject<ChatRoom>();

	private chatRoomsDeleted = new Subject<string>();

	private newJoiner = new Subject<ChatRoom>();

	private newLeaver = new Subject<ChatRoom>();

	private newMessage = new Subject<ChatMessage>();

	private userWriting = new Subject<{room : string, user : UserDto}>();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			this.newMessage.next(message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('UserWriting', (roomId : string, user: UserDto) => {
			this.userWriting.next({room:roomId, user:user })
		});

		this._hubConnection.on('NewChatRoomCreated', (chatRoom: ChatRoom) => {
			this.chatRoomsCreated.next(chatRoom);
		});

		this._hubConnection.on('DeletedChatRoom', (roomId: string) => {
			this.chatRoomsDeleted.next(roomId);
		});

		this._hubConnection.on('NewJoiner', (room: ChatRoom) => {
			//quelqu'un vient de rejoindre une chat room dont je suis le participant
			this.newJoiner.next(room);
		});

		this._hubConnection.on('NewLeaver', (room: ChatRoom) => {
			//quelqu'un vient de partir d'une chat room dont je suis le participant
			this.newLeaver.next(room);
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
	 * Get all chat rooms
	 * @returns chatroom[]
	 */
	public async getRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;
		//initialiser les groupes de connexion signalR ? pour chaque chat room et chaque participant ajouter au groupe de connexion de la chatroom
		return await this._hubConnection.invoke<ChatRoom[]>('GetRooms');
	}

	/**
	 * Get all messages from a chat room
	 * @returns ChatMessage[]
	 */
	public async InitConnexionAndGetMessages(roomId : string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;
		//initialiser les groupes de connexion signalR ? pour chaque chat room et chaque participant ajouter au groupe de connexion de la chatroom
		return await this._hubConnection.invoke<ChatMessage[]>('InitConnexionAndGetMessages', roomId);
	}
	/**
	 * Get new chat room created from the server
	 * @returns un Observable<ChatRoom> pour les évènement de création de chat room
	 */
	public getChatRoomsCreated(): Observable<ChatRoom> {
		return this.chatRoomsCreated.asObservable();
	}

	/**
	 * Get chat room deleted from the server
	 * @returns un Observable<ChatRoom> pour les évènement de suppression de chat room
	 */
	public getChatRoomsDeleted(): Observable<string> {
		return this.chatRoomsDeleted.asObservable();
	}

	/**
	 * Get new joiners in a chat room from the server
	 * @returns un Observable<ChatRoom> pour les évènement de nouveaux participants dans une chat room
	 */
	public getNewJoiners(): Observable<ChatRoom> {
		return this.newJoiner.asObservable();
	}

	/**
	 * Get leavers in a chat room from the server
	 * @returns un Observable<ChatRoom> pour les évènement de participants sortant dans une chat room
	 */
	public getNewLeavers(): Observable<ChatRoom> {
		return this.newLeaver.asObservable();
	}

	/**
	 * Get new message from the server
	 * @returns un Observable<ChatMessage> pour les évènement de nouveaux messages
	 */
	public getNewMessage(): Observable<ChatMessage> {
		return this.newMessage.asObservable();
	}

	/**
	 * Get new message from the server
	 * @returns un Observable<ChatMessage> pour les évènement de nouveaux messages
	 */
	public getWritingUser(): Observable<{room : string, user : UserDto}> {
		return this.userWriting.asObservable();
	}

	/**
	 * Create a new chat room
	 */
	public async createChatRoom(chatRoomName : string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', chatRoomName);
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

	public async deleteChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('DeleteChatRoom', roomId);
	}

	public async imWriting(roomId : string){
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendUserWriting', roomId);
	}

}
