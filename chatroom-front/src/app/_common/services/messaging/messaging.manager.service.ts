import { computed, inject, Injectable } from "@angular/core";
import { MessagingService } from "./messaging.service";
import { ChatRoom } from "../../models/chat-room.model";
import { BehaviorSubject, map, Observable, of, tap } from "rxjs";
import { ChatMessage } from "../../models/chat-message.model";
import { subscribe } from "diagnostics_channel";
import { User } from "../../models/user.model";
import { AccountService } from "../account/account.service";

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
    private messagesHistoryByChatRoom$ = new BehaviorSubject<Map<string, ChatMessage[]>>(new Map());
    private participants$ = new BehaviorSubject<User[]>([]); // Messages du chat actif

    private readonly _accountService = inject(AccountService);
    public readonly user = computed<User | null>(this._accountService.user);


    constructor(private messagingService: MessagingService,) {
        this.subscribeToHub();
    }


    private subscribeToHub() {
        this.messagingService.onCreateChatRoom().subscribe(chatRoom => this.handleCreateChatRoom(chatRoom));
        this.messagingService.onNewMessage().subscribe(message => this.handleNewMessage(message));
        this.messagingService.onUserJoinChatRoom().subscribe((joinedObj) => this.handleUserJoinChatRoom(joinedObj.chatRoomId, joinedObj.user));
        this.messagingService.onUserLeaveChatRoom().subscribe(chatRoom => this.handleUserLeaveChatRoom(chatRoom));
    }

    // Créer une nouvelle chatRoom et la rejoins
    async createNewChatRoom(): Promise<void> {

        await this.messagingService.createChatRoom()
            .then(chatRoom => {
                this.addRoomToJoinedRoom(chatRoom.id);
                this.activeChatRoomId$.next(chatRoom.id);
            })
            .catch(error => {
                console.log("erreur lors de la creation du chat:", error)
                // TODO notification erreur
            });
    }

    /* Récupère toutes les salles disponibles */
    async loadAllChatRooms(): Promise<void> {
        const chatRooms = await this.messagingService.getAllChatRooms();
        console.log("Load all ChatRooms : ", chatRooms)
        this.allChatRooms$.next(chatRooms);
    }

    /* Rejoint une chatRoom et charge son historique */
    async joinChatRoom(roomId: string): Promise<void> {
        if (this.activeChatRoomId$.value === roomId) return;

        if (this.joinedChatRooms$.getValue().some(r => r.id == roomId)) {
            this.setJoinedRoomToCurrentChatRoom(roomId);
        } else if (this.allChatRooms$.getValue().some(r => r.id == roomId)) {
            this.addRoomToJoinedRoom(roomId);
            this.setJoinedRoomToCurrentChatRoom(roomId);
        } else {
            await this.messagingService.joinChatRoom(roomId)
                .then(chatMessage => {
                    this.addRoomToJoinedRoom(roomId);
                    this.updateMessageHistory(roomId, chatMessage);
                    this.activeChatRoomId$.next(roomId);
                })
                .catch((error) => {
                    console.log("Impossible de rejoindre la room, une erreur est survenue :", error.message)
                    // TODO notification la salle est innacessible, fermé lorsque le dernier utilateur a quitter la room ?
                    return;
                });
        }
    }


    /** Quitte une salle */
    async leaveChatRoom(roomId: string): Promise<void> {
        await this.messagingService.leaveChatRoom(roomId)
            .then(_ => {
                if (this.activeChatRoomId$.getValue() === roomId) {
                    this.removeChatRoomFromJoinedRooms(roomId);
                    this.loadFirstChatRoomAvailable();
                } else {
                    this.removeChatRoomFromJoinedRooms(roomId);
                }

            }).catch(error => {
                console.log("Une erreur est survenue pour quitter la salle : ", error)
                // TODO notification
            });
    }

    // Met une chatRoom rejointe en "active"
    public setJoinedRoomToCurrentChatRoom(roomId: string) {
        if (this.joinedChatRooms$.getValue().some(r => r.id == roomId)) {
            this.activeChatRoomId$.next(roomId);
        }
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
    public getMessagesHistoryOfCurrentChatRoom$(): Observable<ChatMessage[]> {
        return this.messagesHistoryByChatRoom$.pipe(
            //tap(() => { console.log("Room joined : ", this.joinedChatRooms$.getValue()) }),
            //tap(() => { console.log("Historique des room joined : ", this.activeChatRoomId$.getValue()) }),
            map(messagesMap => messagesMap.get(this.activeChatRoomId$.getValue() ?? " ") || [])
        );
    }

    // Récupère les messages du chat Room
    public getParticipants$(): Observable<User[]> {
        return this.participants$.asObservable();
    }

    /* Gestion de la réception des messages  */
    private handleNewMessage(message: ChatMessage) {
        console.log("Notif nouveau message", message.roomId)

        this.addMessageToChatRoom(message.roomId, message);
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

    private handleCreateChatRoom(chatRoom: ChatRoom) {
        this.addNewRoomToAllAvailableRoom(chatRoom);
    }


    // Suite aux autres commentaires, je met à jour toute la Room
    //  alors que je pourrais mettre que les utilisateurs
    /*
        const updatedRooms = this.allChatRooms$.getValue().map(room =>
          room.id === updatedRoom.id
            ? { ...room, participants: [...room.participants, newParticipant] }
            : room
        );
    */
    private handleUserJoinChatRoom(chatRoomId: string, user: User) {
        const joinedRooms = this.joinedChatRooms$.getValue();
        const chatRoom = joinedRooms.find(r => r.id === chatRoomId);
        if (chatRoom) {
            const userAlreadyAdded = chatRoom.participants.some(u => u.id === user.id);
            if (!userAlreadyAdded) {
                const updatedRooms = joinedRooms.map(room =>
                    room.id === chatRoomId
                        ? { ...room, participants: [...room.participants, user] }
                        : room
                );

                this.joinedChatRooms$.next(updatedRooms);
            }
        } else {
            console.log("Données incohérentes : la chatRoom n'existe pas dans la liste des rooms rejointes.");
        }


    }
    private handleUserLeaveChatRoom(chatRoom: ChatRoom) {
        this.updateChatRooms(chatRoom);
        // TODO notification muser leaved
    }


    // Mise à jour des chatRooms avec la "nouvelle"
    private updateChatRooms(chatRoom: ChatRoom) {

        const allRooms = this.allChatRooms$.getValue();
        if (allRooms.some(room => room.id === chatRoom.id)) {
            this.allChatRooms$.next(allRooms.map(room => (room.id === chatRoom.id ? chatRoom : room)));
        }

        const joinedRooms = this.joinedChatRooms$.getValue();
        if (joinedRooms.some(room => room.id === chatRoom.id)) {
            this.joinedChatRooms$.next(joinedRooms.map(room => (room.id === chatRoom.id ? chatRoom : room)));
        }
    }


    /* Gestion des messages */

    public async sendMessage(message: string) {
        console.log("envoie du message pour la room active :", this.activeChatRoomId$.value ?? "null")
        if (this.activeChatRoomId$.value == null) return;
        try {
            console.log("Send message manager")
            await this.messagingService.sendMessage(this.activeChatRoomId$.value, message)
        } catch (error) {
            // TODO notification message d'erreur
            console.log("Erreur lors de l'envoie du message :", message)
        }
    }

    private addMessageToChatRoom(chatRoomId: string, chatMessage: ChatMessage) {
        if (!this.joinedChatRooms$.getValue().some(r => r.id == chatRoomId)) return;

        const messagesHistoryToUpdate = new Map(this.messagesHistoryByChatRoom$.getValue());
        const messages = messagesHistoryToUpdate.get(chatRoomId) || [];
        messagesHistoryToUpdate.set(chatRoomId, [...messages, chatMessage]);
        this.messagesHistoryByChatRoom$.next(messagesHistoryToUpdate);
    }


    private addNewRoomToAllAvailableRoom(chatRoom: ChatRoom) {
        const allRooms = this.allChatRooms$.getValue();
        this.allChatRooms$.next([...allRooms, chatRoom]);
    }

    // Ajouter la salle à la liste des salles rejointes si pas encore dedans
    private addRoomToJoinedRoom(roomId: string) {
        const allRooms = this.allChatRooms$.getValue();
        const room = allRooms.find(r => r.id === roomId);
        if (room) {
            const joinedRooms = this.joinedChatRooms$.getValue();
            if (!joinedRooms.some(r => r.id === roomId)) {
                this.joinedChatRooms$.next([...joinedRooms, room]);
            } else console.log("La salle est déjà présente dans la liste des chatRejoins")
        } else { throw new Error("La salle que vous essayer de rejoindre n'est pas dans la liste des chats disponibles.") }
    }



    // Supprime un chatRoom de "tous les chats", rejoins et disponibles
    private removeChatRoomFromJoinedRooms(roomId: string) {
        const updatedJoinedRooms = this.joinedChatRooms$.getValue().filter(room => room.id !== roomId);
        this.joinedChatRooms$.next(updatedJoinedRooms);
    }

    // Charge la première chatRoom de disponible
    private loadFirstChatRoomAvailable() {
        const joinedRooms = this.joinedChatRooms$.getValue();

        if (joinedRooms.length > 0) {
            const firstChatRoom = joinedRooms[0];
            this.activeChatRoomId$.next(firstChatRoom.id);
        } else {
            // pas de chat rejoins
            this.activeChatRoomId$.next(null);
        }
    }

    // Remplace les messages de la chatRoom rejointe
    private updateMessageHistory(roomId: string, messages: ChatMessage[]) {
        const messagesMap = new Map(this.messagesHistoryByChatRoom$.getValue());
        messagesMap.set(roomId, messages);
        this.messagesHistoryByChatRoom$.next(messagesMap);
    }
}
