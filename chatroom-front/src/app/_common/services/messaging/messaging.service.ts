import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { BehaviorSubject, catchError, from, Observable, switchMap, tap, throwError } from 'rxjs';
import { AccountService } from '../account/account.service';
import { User } from '../../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {
	private _roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
	rooms$ = this._roomsSubject.asObservable();
	private _joinedRoomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  	joinedRoomsObservable$ = this._joinedRoomsSubject.asObservable();
	private readonly _accountService = inject(AccountService);
	public readonly user$ = computed<User | null>(this._accountService.user);

	constructor() {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			const currentRooms = this._joinedRoomsSubject.value.map(room => {
				if (room.id === message.roomId) {
					return { ...room, messages: [...room.messages, message] };
				}
				return room;
			});
	
			this._joinedRoomsSubject.next(currentRooms);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {});
		
		this._hubConnection.on('NewRoom', (newRoom: ChatRoom) => {
			console.log('New chat room added:', newRoom);
			const currentRooms = this._roomsSubject.value;
			this._roomsSubject.next([...currentRooms, newRoom]);
			/* this._notificationSvc.sendNotification(`La salle de chat ${chatRoom.id} vient d'être créée !`);
			if (chatRoom.participants.some(participant => participant.id === this.user()?.id)) {
				this.joinedRoomsSubject.next([...this.joinedRoomsSubject.value, chatRoom]);
			} */
		});

		//Joigned ChatRoom Event
		this._hubConnection.on('UserJoignedChatRoom', (roomId: string, user: User) => {
			console.log(`User ${user.firstName} a rejoint la salle ${roomId}`);
			const currentRooms = this._roomsSubject.value.map(room => {
				if (room.id === roomId) {
					return {
						...room,
						participants: [...room.participants, user],
					};
				}
				return room;
			});

			this._roomsSubject.next(currentRooms);
			/* this._notificationSvc.setNewUserMessage(roomId, `${user.firstName} a rejoint la ChatRoom !`); */
		});

		//Leaved ChatRoom Event
		this._hubConnection.on('UserLeavedChatRoom', (roomId: string, userEvent: User) => {
			console.log(`${userEvent.firstName} a quitté la salle.`);
			const currentRooms = this._roomsSubject.value;
			const updatedRooms = currentRooms.map((room) => {
				if (room.id === roomId) {
					return {
						...room,
						participants: room.participants.filter((participant) => participant.id !== userEvent.id),
					};
				}
				return room;
			});
			this._roomsSubject.next(updatedRooms);
			/* this._notificationSvc.setNewUserMessage(roomId, `${userEvent.firstName} a quitté la ChatRoom !`); */
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
	 * Create a new chat room
	 */
	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;

		return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;

		const room = await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
		
		return room
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public async getAllChatRoom(): Promise<void> {
		await this.getConnectionPromise;
		const rooms = await this._hubConnection.invoke<ChatRoom[]>('GetAllChatRooms');
		this._roomsSubject.next(rooms); // Initialise la liste des salles dans le BehaviorSubject
	}

	/**
	 * Join the chat room and get all chat room message history
	 */
	public joinChatRoom(roomId: string): Observable<ChatRoom> {
		return new Observable((observer) => {
			this.getConnectionPromise
			  .then(() => {
				this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId)
				  .then((chatHistory) => {
					const currentRooms = this._roomsSubject.value;
					const room = currentRooms.find((r) => r.id === roomId);
					if (room) {
						room.messages = chatHistory;
	  
						const currentJoinedRooms = this._joinedRoomsSubject.value;
						if (!currentJoinedRooms.some((r) => r.id === roomId)) {
						  this._joinedRoomsSubject.next([...currentJoinedRooms, room]);
						}
						observer.next(room);
						observer.complete();
					} else {
					  observer.error(new Error(`Salle avec l'ID ${roomId} introuvable`));
					}
				  })
				  .catch((error) => observer.error(error));
			  })
			  .catch((error) => observer.error(error));
			 });
	}

	/**
	 * Get all chat room messages
	 */
	public leaveChatRoom(roomId: string): Observable<void> {
		return from(this.getConnectionPromise).pipe(
			switchMap(() => from(this._hubConnection.invoke('LeaveChatRoom', roomId))),
			tap(() => {
				/* this._notificationSvc.clearMessagesForRoom(roomId); */
				const currentJoinedRooms = this._joinedRoomsSubject.value;
				const updatedJoinedRooms = currentJoinedRooms.filter((room) => room.id !== roomId);
				this._joinedRoomsSubject.next(updatedJoinedRooms);


				const currentRooms = this._roomsSubject.value;
				const updatedRooms = currentRooms.map((room) => {
					if (room.id === roomId) {
						return {
							...room,
							participants: room.participants.filter(
								(participant) => participant.id !== this.user$()?.id
							),
						};
					}
					return room;
				});
				this._roomsSubject.next(updatedRooms);
			}),
			catchError((error) => {
				console.error(`Erreur lors de la tentative de sortie de la salle ${roomId}, error`);
				return throwError(() => error);
			}),
		);
	}

	/**
	 * Send message to the chat room
	 */
	public async sendMessage(roomId: string, message: string): Promise<any> {
		await this.getConnectionPromise;

		await this._hubConnection.invoke('SendMessage', roomId, message);
	}
}
