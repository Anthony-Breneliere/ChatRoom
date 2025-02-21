import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { throttleTime, map } from 'rxjs/operators';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { ChatRoom } from '../_common/models/chat-room.model';
import { ChatMessage } from '../_common/models/chat-message.model';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss'],
	standalone: true,
	imports: [CommonModule],
})
export class ChatRoomComponent implements OnInit, AfterViewInit {
	// Signal pour la liste des chat rooms
	chatRooms = signal<ChatRoom[]>([]);
	// Liste des messages de la room active
	messages: ChatMessage[] = [];
	// Identifiant de la room active
	currentRoomId: string = '';
	// Pour afficher "user is typing"
	userTyping: string | null = null;

	// Subject pour capturer les frappes (typing)
	private typingSubject = new Subject<string>();

	@ViewChild('messageInput', { static: false }) messageInput!: ElementRef<HTMLInputElement>;

	constructor(private messagingService: MessagingService) {}

	ngOnInit() {
		// Charger la liste des chat rooms
		this.messagingService.getAllChatRooms().then(chatRooms => {
			this.chatRooms.set(chatRooms);
		});

		// Abonnement pour déclencher notifyUserIsWriting avec throttle
		this.typingSubject.pipe(throttleTime(1000)).subscribe(value => {
			console.log('Throttled typing value:', value);
			if (this.currentRoomId) {
				this.messagingService.notifyUserIsWriting(this.currentRoomId);
			}
		});

		// Abonnement aux nouveaux messages
		this.messagingService.newMessage$.subscribe(message => {
			if (this.currentRoomId && message.roomId === this.currentRoomId) {
				this.messages.push(message);
			}
		});

		// Abonnement à l'événement "UserWriting"
		this.messagingService.userWriting$.subscribe(user => {
			console.log('Received user writing event:', user);
			this.userTyping = user;
			setTimeout(() => {
				this.userTyping = null;
			}, 3000);
		});
	}

	ngAfterViewInit() {
		// Abonnement à l'événement input sur l'élément messageInput
		fromEvent(this.messageInput.nativeElement, 'input')
			.pipe(
				throttleTime(1000),
				map((event: Event) => (event.target as HTMLInputElement).value)
			)
			.subscribe(value => {
				console.log('User is typing, input value:', value);
				this.typingSubject.next(value);
			});
	}

	// Méthode appelée depuis le template lors d'un input
	public onTyping(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.typingSubject.next(value);
	}

	// Crée une nouvelle chat room
	public createChatRoom(): void {
		this.messagingService.createChatRoom().then(chatRoom => {
			this.chatRooms.set([...this.chatRooms(), chatRoom]);
		});
	}

	// Rejoint une chat room et récupère l'historique des messages, puis rafraîchit la room
	public joinChatRoom(roomId: string): void {
		this.currentRoomId = roomId;
		this.messages = []; // Réinitialiser la liste des messages
		this.messagingService
			.joinChatRoom(roomId)
			.then((history: ChatMessage[]) => {
				this.messages = history;
				console.log(`Joined room ${roomId} with history`, history);
				// Rafraîchir les détails de la room
				return this.messagingService.getChatRoom(roomId);
			})
			.then((updatedRoom: ChatRoom) => {
				// Mettre à jour la room dans la liste des chat rooms
				const rooms = this.chatRooms();
				const index = rooms.findIndex(r => r.id === updatedRoom.id);
				if (index !== -1) {
					rooms[index] = updatedRoom;
					this.chatRooms.set([...rooms]);
				}
			})
			.catch(err => console.error(err));
	}

	// Quitte la chat room et rafraîchit la liste des chat rooms
	public closeChatRoom(roomId: string): void {
		this.messagingService
			.leaveChatRoom(roomId)
			.then(() => {
				console.log(`Left room ${roomId}`);
				if (this.currentRoomId === roomId) {
					this.currentRoomId = '';
					this.messages = [];
				}
				return this.messagingService.getAllChatRooms();
			})
			.then((rooms: ChatRoom[]) => {
				this.chatRooms.set(rooms);
			});
	}

	// Envoie un message et efface l'input
	public sendMessage(roomId: string, message: string, input: HTMLInputElement): void {
		if (!message.trim()) return;
		this.messagingService.sendMessage(roomId, message).then(() => {
			console.log('Message sent');
			input.value = '';
		});
	}
}
