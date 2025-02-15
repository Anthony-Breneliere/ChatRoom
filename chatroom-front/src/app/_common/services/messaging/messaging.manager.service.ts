import { Injectable } from "@angular/core";
import { MessagingService } from "./messaging.service";
import { ChatRoom } from "../../models/chat-room.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ChatMessage } from "../../models/chat-message.model";
import { subscribe } from "diagnostics_channel";

@Injectable({
    providedIn: 'root',
})

/**
 * Service principale
 * Permet de géré tous les chats 
 * Gestions des chats rejoins ou non, l'historique
 */
export class MessagingManagerService {

    private allChatRooms$ = new BehaviorSubject<ChatRoom[]>([]); // Tous les salons
    private joinedChatRooms$ = new BehaviorSubject<ChatRoom[]>([]); // Salons rejoints
    private activeChatRoomId$ = new BehaviorSubject<string | null>(null); // Chat actif
    private messages$ = new BehaviorSubject<ChatMessage[]>([]); // Messages du chat actif



    constructor(private messagingService: MessagingService) {
        this.subscribeToHub();
    }


    private subscribeToHub() {
        this.messagingService.onNewMessage().subscribe(message => this.handleNewMessage(message));
    }

    async createNewChatRoom(): Promise<void> {

        await this.messagingService.createChatRoom()
            .then(async chatRoom => {
                this.allChatRooms$
                await this.joinChatRoom(chatRoom.id);
                console.log("Normalement la room est affichée")
            })
            .catch(error => {
                console.log("erreur lors de la creation du chat:", error)
            });
    }

    /** Récupère toutes les salles disponibles */
    async loadAllChatRooms(): Promise<void> {
        const chatRooms = await this.messagingService.getAllChatRooms();
        this.allChatRooms$.next(chatRooms);
    }

    /** Rejoint un salon et charge son historique */
    async joinChatRoom(roomId: string): Promise<void> {
        if (this.activeChatRoomId$.value === roomId) return;

        await this.messagingService.joinChatRoom(roomId)
            .then(chatMessage => {
                this.activeChatRoomId$.next(roomId);
                this.messages$.next(chatMessage);
            })
            .catch((error) => {
                console.log("Impossible de rejoindre la room, une erreur est survenue :", error)
            });

        // Ajouter la salle à la liste des salles rejointes si pas encore dedans
        const allRooms = this.allChatRooms$.value;
        const room = allRooms.find(r => r.id === roomId);
        if (room) {
            const joinedRooms = this.joinedChatRooms$.value;
            if (!joinedRooms.some(r => r.id === roomId)) {
                console.log("je rejoins la room");
                this.joinedChatRooms$.next([...joinedRooms, room]);
            } else console.log("je rejoins pas la room")
        } else { console.log("je rejoins pas la room") }
    }

    /** Quitte une salle */
    async leaveChatRoom(roomId: string): Promise<void> {
        await this.messagingService.leaveChatRoom(roomId);

        if (this.activeChatRoomId$.value === roomId) {
            this.activeChatRoomId$.next(null);
            this.messages$.next([]);
        }

        this.joinedChatRooms$.next(
            this.joinedChatRooms$.value.filter(chat => chat.id !== roomId)
        );

        console.log("chat rooms apres avoir cquitter :", this.joinedChatRooms$)
    }


    /* Observables pour mes sous composants */
    // Récupère l'id du chat actuellement rejoins
    public getActiveChatRoomId$(): Observable<string | null> {
        return this.activeChatRoomId$.asObservable();
    }

    // Récupère tous les chats rejoins par l'utilsateur
    public getJoinedChatRooms$(): Observable<ChatRoom[]> {
        return this.joinedChatRooms$.asObservable();
    }

    // Récupère les chats
    public getAllChatRooms$(): Observable<ChatRoom[]> {
        return this.allChatRooms$.asObservable();
    }

    // Récupère les messages du chat Room
    public getMessagesHistory$(): Observable<ChatMessage[]> {
        return this.messages$.asObservable();
    }


    /* Gestion de la réception des messages  */
    private handleNewMessage(message: ChatMessage) {
        const currentMessages = this.messages$.getValue();
        console.log("Joined rooms", this.joinedChatRooms$)
        this.messages$.next([...currentMessages, message]);
    }

    // private handleDeletedMessage(message: ChatMessage) {
    //     const updatedMessages = this.messages$.getValue().filter(m => m.id !== message.id);
    //     this.messages$.next(updatedMessages);
    // }

    // private handleEditedMessage(message: ChatMessage) {
    //     const updatedMessages = this.messages$.getValue().map(m =>
    //         m.id === message.id ? message : m
    //     );
    //     this.messages$.next(updatedMessages);
    // }


    /* Gestion de l'envoie des messages */

    public sendMessage(message: string) {
        if (this.activeChatRoomId$.value == null) return;
        this.messagingService.sendMessage(this.activeChatRoomId$.value, message)
    }
}