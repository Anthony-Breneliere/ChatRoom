import { computed, inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';
import { Observable, BehaviorSubject, finalize, catchError, from, map, switchMap, tap, throwError } from 'rxjs';
import { AccountService } from '../account/account.service';
import { User } from '../../models/user.model';
import { join } from 'path';
import { NotificationService } from '../notifications/notification.service';

@Injectable({
	providedIn: 'root',
})

export class MessagingService extends SignalRClientBase {
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
	private roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
	public roomsObservable = this.roomsSubject.asObservable();
	private joinedRoomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  public joinedRoomsObservable = this.joinedRoomsSubject.asObservable();

	constructor(private _notificationSvc: NotificationService,) {
		super(environment.API_URL + '/hub/messaging');

		// Handle messaging events
		this._hubConnection.on('NewMessage', (message: ChatMessage) => {
			console.log('New message received:', message);
			this.addMessageToRoom(message.roomId, message);
		});

		this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
		});

		this._hubConnection.on('UserWriting', (user: ChatMessage) => {
		});

		//New ChatRoom Event
		this._hubConnection.on('NewChatRoom', (chatRoom: ChatRoom) => {
			console.log('New chatRoom created:', chatRoom);
			const currentRooms = this.roomsSubject.value;
      this.roomsSubject.next([...currentRooms, chatRoom]);
			this._notificationSvc.sendNotification(`La salle de chat ${chatRoom.id} vient d'être créée !`);
			if (chatRoom.participants.some(participant => participant.id === this.user()?.id)) {
				this.joinedRoomsSubject.next([...this.joinedRoomsSubject.value, chatRoom]);
			}
		});

		//Joigned ChatRoom Event
		this._hubConnection.on('JoignedChatRoom', (roomId: string, user: User) => {
			console.log(`User ${user.firstName} a rejoint la salle ${roomId}`);
			const currentRooms = this.roomsSubject.value.map(room => {
				if (room.id === roomId) {
					return {
						...room,
						participants: [...room.participants, user],
					};
				}
				return room;
			});

			this.roomsSubject.next(currentRooms);
			this._notificationSvc.setNewUserMessage(roomId, `${user.firstName} a rejoint la ChatRoom !`);
		});

		//Leaved ChatRoom Event
		this._hubConnection.on('LeavedChatRoom', (roomId: string, userEvent: User) => {
			console.log(`${userEvent.firstName} a quitté la salle.`);
			const currentRooms = this.roomsSubject.value;
			const updatedRooms = currentRooms.map((room) => {
				if (room.id === roomId) {
					return {
						...room,
						participants: room.participants.filter((participant) => participant.id !== userEvent.id),
					};
				}
				return room;
			});
			this.roomsSubject.next(updatedRooms);
			this._notificationSvc.setNewUserMessage(roomId, `${userEvent.firstName} a quitté la ChatRoom !`);
		});

		//User is typing Event
		this._hubConnection.on('UserIsTyping', (roomId: string, user: User) => {
			this._notificationSvc.setUserTyping(roomId, user);
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
	 * @returns chatroom
	 */
		public async getAllChatRooms(): Promise<ChatRoom[]> {
			await this.getConnectionPromise;
			const currentRooms = await this._hubConnection.invoke<ChatRoom[]>('GetAllChatRooms');
			this.roomsSubject.next(currentRooms);
			const joinedRooms = currentRooms.filter((room) =>
				room.participants.some((participant) => participant.id === this.user()?.id)
			);
			await this._hubConnection.invoke('SubscribeAllChatRooms', joinedRooms)
			.then(() => {
			})
			.catch(err => {
				console.error('Erreur lors de l\'abonnement aux rooms', err);
			});

			joinedRooms.forEach(async (room) => {
				const messages = await this._hubConnection.invoke<ChatMessage[]>('GetMessagesInRoom', room.id);
				room.messages = messages
			});
			this.joinedRoomsSubject.next(joinedRooms);
			return currentRooms;
		}

	/**
	 * Create a new chat room
	 */
	public async createChatRoom(): Promise<ChatRoom> {
		await this.getConnectionPromise;
		const chatRoom = await this._hubConnection.invoke<ChatRoom>('CreateChatRoom');
		const chatRoomTab = [chatRoom]
		await this._hubConnection.invoke('SubscribeAllChatRooms', chatRoomTab)
			.then(() => {
			})
			.catch(err => {
				console.error('Erreur lors de l\'abonnement à la room', err);
			});
		return chatRoom;
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
              const currentRooms = this.roomsSubject.value;
              const room = currentRooms.find((r) => r.id === roomId);
              if (room) {
                  room.messages = chatHistory;

                  const currentJoinedRooms = this.joinedRoomsSubject.value;
                  if (!currentJoinedRooms.some((r) => r.id === roomId)) {
                    this.joinedRoomsSubject.next([...currentJoinedRooms, room]);
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
	 * leave chat room
	 */
	public leaveChatRoom(roomId: string): Observable<void> {
		return from(this.getConnectionPromise).pipe(
			switchMap(() => from(this._hubConnection.invoke('LeaveChatRoom', roomId))),
			tap(() => {
				this._notificationSvc.clearMessagesForRoom(roomId);
				const currentJoinedRooms = this.joinedRoomsSubject.value;
				const updatedJoinedRooms = currentJoinedRooms.filter((room) => room.id !== roomId);
				this.joinedRoomsSubject.next(updatedJoinedRooms);


				const currentRooms = this.roomsSubject.value;
				const updatedRooms = currentRooms.map((room) => {
					if (room.id === roomId) {
						return {
							...room,
							participants: room.participants.filter(
								(participant) => participant.id !== this.user()?.id
							),
						};
					}
					return room;
				});
				this.roomsSubject.next(updatedRooms);
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
	public sendMessage(roomId: string, content: string): Observable<void> {
		return from(this.getConnectionPromise).pipe(
			switchMap(() => from(this._hubConnection.invoke('SendMessage', roomId, content))),
			catchError((error) => {
				console.error('Erreur envoi message', error);
				return throwError(() => error);
			})
		);
	}

	/**
	 * Add messages to room with subject
	*/
	private addMessageToRoom(roomId: string, message: ChatMessage) {
		const currentRooms = this.joinedRoomsSubject.value.map(room => {
			if (room.id === roomId) {
				return { ...room, messages: [...room.messages, message] };
			}
			return room;
		});

		this.joinedRoomsSubject.next(currentRooms);
	}

	/**
	 * UserIsTyping
	*/
	public userIsTyping(roomId: string, user: User) {
		this._hubConnection.invoke('userIsTyping', roomId, user).catch(err => console.error(err));
	}

}
