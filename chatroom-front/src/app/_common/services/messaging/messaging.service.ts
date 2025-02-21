import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Subject } from 'rxjs';
import { User } from '../../models/user.model';

export type RoomUserTuple = [ChatRoom, User];

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

	private newChatRoomSubject = new Subject<ChatRoom>();
	private updateChatRoomParticipantSubject = new Subject<ChatRoom>();

	newChatRoom$ = this.newChatRoomSubject.asObservable();
	updateChatRoomParticipant$ = this.updateChatRoomParticipantSubject.asObservable();

	private newMessageSubject = new Subject<ChatMessage>();
  private userWritingSubject = new Subject<RoomUserTuple>();

	newMessage$ = this.newMessageSubject.asObservable();
  userWriting$ = this.userWritingSubject.asObservable();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewChatRoom', (room: ChatRoom) => {
      console.log('New room has been created:', room);
      this.newChatRoomSubject.next(room);
    });

		this._hubConnection.on('UpdateChatRoomParticipant', (room: ChatRoom) => {
			console.log('A participant has joined/leaved the room:', room);
			this.updateChatRoomParticipantSubject.next(room);
		});

    this._hubConnection.on('NewMessage', (message: ChatMessage) => {
      console.log('New message received:', message);
      this.newMessageSubject.next(message);
    });

		this._hubConnection.on('SomeoneWriteInChatRoom', (room: ChatRoom, user: User) => {
			console.log('Someone is writing in the chat room:', room, user);
  		this.userWritingSubject.next([room, user] as RoomUserTuple);
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
	 * Get all chat room
	 * @param roomId
	 * @returns chatroom
	 */
	public async getChatRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom[]>('ListChatRoom');
	}

	/**
	 * Create a new chat room
	 */
	public async createChatRoom(chatRoomName: string, creatorIdentifier: string): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', chatRoomName, creatorIdentifier);
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async joinChatRoom(roomId: string, creatorId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('JoinChatRoom', roomId, creatorId);
	}

	/**
	 * get all chat room message history
	 */
	public async getChatRoomHistory(roomId: string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatMessage[]>('GetChatRoomHistory', roomId);
	}

	/**
	 * Get all chat room messages
	 */
	public async leaveChatRoom(roomId: string, creatorId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('LeaveChatRoom', roomId, creatorId);
	}

	public async userWriteInChatRoom(roomId: string, creatorId: string): Promise<void> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SomeoneWriteInChatRoom', roomId, creatorId);
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, creatorId: string, chatMessage: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendMessage', roomId, creatorId, chatMessage);
	}
}
