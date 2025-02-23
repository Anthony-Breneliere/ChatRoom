import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { ChatMessageDto as ChatMessage } from '../../models/chat-message.model';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { ChatRoom } from '../../models/chat-room.model';
import { SignalRClientBase } from '../signalr/signalr.client.base';

@Injectable({
  providedIn: 'root',
})
export class MessagingService extends SignalRClientBase {

  public messagesSub = new Subject<ChatMessage>();
  public chatRoomsSub = new Subject<ChatRoom>();
  public messageEditedSub = new Subject<ChatMessage>();
  public messageDeletedSub = new Subject<ChatMessage>();
  private participantJoinedSub = new Subject<string>();
  private participantLeftSub = new Subject<string>();

  public messagesObs = this.messagesSub.asObservable();
  public chatroomsObs = this.chatRoomsSub.asObservable();
  public messageEditedObs = this.messageEditedSub.asObservable();
  public messageDeletedObs = this.messageDeletedSub.asObservable();
  public participantJoinedObs = this.participantJoinedSub.asObservable();
  public participantLeftObs = this.participantLeftSub.asObservable();
  
  constructor() {
    super(environment.API_URL + '/hub/messaging');

    // Gestion des événements de messagerie
    this._hubConnection.on('NewMessage', (message: ChatMessage) => {
      this.messagesSub.next(message);
    });

    this._hubConnection.on('EditedMessage', (message: ChatMessage) => {
      console.log('Message édité:', message);
      this.messageEditedSub.next(message);
    });

    this._hubConnection.on('DeletedMessage', (message: ChatMessage) => {
      console.log('Message supprimé:', message);
      this.messageDeletedSub.next(message);
    });

    this._hubConnection.on('UserWriting', (user: string) => {
      console.log(`${user} est en train d’écrire...`);
    });

    this._hubConnection.on('ParticipantJoined', (userId: string) => {
      console.log(`Participant ${userId} a rejoint la salle de chat.`);
      this.participantJoinedSub.next(userId);
    });

    this._hubConnection.on('ParticipantLeft', (userId: string) => {
      console.log(`Participant ${userId} a quitté la salle de chat.`);
      this.participantLeftSub.next(userId);
    });
  }

  /**
   * Récupère un chat room en fonction de l'ID de la salle
   * @param roomId L'ID de la chat room
   * @returns La chat room correspondant à l'ID
   */
  public async getChatRoom(roomId: string): Promise<ChatRoom> {
    await this.getConnectionPromise;
    return await this._hubConnection.invoke<ChatRoom>('GetChatRoom', roomId);
  }

    /**
   * Récupère la liste de toutes les chat rooms
   * @returns La liste des chat rooms
   */
    public async getChatRooms(): Promise<ChatRoom[]> {
      await this.getConnectionPromise;
      return await this._hubConnection.invoke<ChatRoom[]>('GetChatRooms');
    }

  /**
   * Crée une nouvelle chat room
   * @returns La chat room créée
   */
  public async createChatRoom(roomName: string): Promise<ChatRoom> {
    await this.getConnectionPromise;
    return await this._hubConnection.invoke<ChatRoom>('CreateChatRoom', roomName);
  }

  /**
   * Rejoindre une chat room et récupérer l'historique des messages
   * @param roomId L'ID de la chat room
   * @returns L'historique des messages de la chat room
   */
  public async joinChatRoom(roomId: string): Promise<ChatMessage[]> {
    await this.getConnectionPromise;
    return await this._hubConnection.invoke<ChatMessage[]>('JoinChatRoom', roomId);
  }

  /**
   * Quitter une chat room
   * @param roomId L'ID de la chat room
   */
  public async leaveChatRoom(roomId: string): Promise<void> {
    await this.getConnectionPromise;
    await this._hubConnection.invoke('LeaveChatRoom', roomId);
  }

  /**
   * Envoi un message dans une chat room
   * @param roomId L'ID de la chat room
   * @param message Le message à envoyer
   */
  public async sendMessage(roomId: string, message: string): Promise<void> {
    await this.getConnectionPromise;
    await this._hubConnection.invoke('SendMessage', roomId, message);
  }

}
