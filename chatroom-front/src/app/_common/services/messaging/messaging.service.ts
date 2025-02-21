import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
	// Subject pour diffuser l'événement "user is writing"
	private _userWritingSubject = new Subject<string>();
	public userWriting$ = this._userWritingSubject.asObservable();

	// Subject pour diffuser les nouveaux messages
	private _newMessageSubject = new Subject<ChatMessage>();
	public newMessage$ = this._newMessageSubject.asObservable();

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Écoute de l'événement "NewMessage"
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('New message received:', message);
			this._newMessageSubject.next(message);
		});
		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
			// Gestion des messages édités si besoin
		});
		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
			// Gestion des messages supprimés si besoin
		});

		// Écoute de l'événement "UserWriting"
		this._hubConnection.on('UserWriting', (user: string) => {
			console.log('User is writing:', user);
			this._userWritingSubject.next(user);
		});
	}

	public async joinChatRoom(roomId: string): Promise<ChatMessage[]> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
	}

	public async leaveChatRoom(roomId: string): Promise<void> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke('LeaveChatRoom', roomId);
	}

	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke('SendMessage', roomId, message);
	}

	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
	}

	public async getAllChatRooms(): Promise<ChatRoom[]> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatRoom[]>('GetAllChatRooms');
	}

	public async notifyUserIsWriting(roomId: string): Promise<void> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke('NotifyUserIsWriting', roomId);
	}

	// Nouvelle méthode pour rafraîchir les détails d'une room
	public async getChatRoom(roomId: string): Promise<ChatRoom> {
		await this.getConnectionPromise;
		return await this._hubConnection.invoke<ChatRoom>('GetChatRoom', roomId);
	}
}
