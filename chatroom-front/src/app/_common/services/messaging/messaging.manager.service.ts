import { computed, inject, Injectable } from "@angular/core";
import { MessagingService } from "./messaging.service";
import { ChatRoom } from "../../models/chat-room.model";
import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import { ChatMessage } from "../../models/chat-message.model";
import { User } from "../../models/user.model";
import { AccountService } from "../account/account.service";
import { NotificationService } from "../notification/notification.service";
import { formatUserName, UserDto } from "../../dto/user.dto";
import { has } from "lodash";

@Injectable({
    providedIn: 'root',
})

/**
 * Remarques sur mon propre code (qui n'est pas propre)
 *   Amélioration sur les événemnts : j'ai des envoie de modification next() qui pourraient être regroupés addRoomToJoinedRoom, addUserToJoinedRoom, updateFullMessageHistory par exemple
 *   Dans mes observables j'ai séparé les joinedrooms, des participants, de l'historique (j'ai fait au fur et a messure : besoin refacto pour regrouper + efficacité, maintenance)
 *   
 *   Et j'ai également fait une gestion avec un seul chat actif en gardant en mémoire l'historique
 *   Ce qui fait que toutes les chats rooms ne s'affichent pas en même temps ... , on garde cependant
 *   l'historique des messages pour chaque chatRoom, ainsi que leur participants à jour pour les chats "rejoins" dans ce service
 */



/**
 * Service principale
 * Permet de géré tous les chats 
 * Gestions des chats rejoins ou non, l'historique
 */
export class MessagingManagerService {

    private allChatRooms$ = new BehaviorSubject<ChatRoom[]>([]); // Tous les salons
    private joinedChatRooms$ = new BehaviorSubject<ChatRoom[]>([]); // Salons rejoints
    private activeChatRoomId$ = new BehaviorSubject<string | null>(null); // Chat actif
    private messagesHistoryByChatRoom$ = new BehaviorSubject<Map<string, ChatMessage[]>>(new Map()); // historique (refacto avec le joinedChatRooms$ ?)
    private participants$ = new BehaviorSubject<User[]>([]); // Messages du chat actif
    private userTypingSubject$ = new Subject<string>();
    private readonly _accountService = inject(AccountService);
    private readonly _user = computed<User | null>(this._accountService.user);


    constructor(private messagingService: MessagingService, private notificationService: NotificationService) {
        this.subscribeToHub();

    }


    private subscribeToHub() {
        this.messagingService.onCreateChatRoom().subscribe(chatRoom => this.handleCreateChatRoom(chatRoom));
        this.messagingService.onNewMessage().subscribe(message => this.handleNewMessage(message));
        this.messagingService.onUserJoinChatRoom().subscribe((obj) => this.handleUserJoinChatRoom(obj.chatRoomId, obj.user));
        this.messagingService.onUserLeaveChatRoom().subscribe(obj => this.handleUserLeaveChatRoom(obj.chatRoomId, obj.user));
        this.messagingService.onUserIsTyping().subscribe((obj) => this.handleUserIsTyping(obj.chatRoomId, obj.user))
    }



    // Créer une nouvelle chatRoom et la rejoins
    async createNewChatRoom(chatName: string): Promise<void> {

        await this.messagingService.createChatRoom(chatName)
            .then(async chatRoom => {
                await this.joinChatRoom(chatRoom.id)

                this.addUserToJoinedRoom(chatRoom.id, chatRoom.participants)

            })
            .catch(error => {
                console.log("erreur lors de la creation du chat:", error)
                // TODO notification erreur
                // this.notificationService.showNotification("Le chat n'a pas pu être créé", "error", 3000);
            });
    }

    /* Récupère toutes les salles disponibles */
    async loadAllChatRooms(): Promise<void> {
        const chatRooms = await this.messagingService.getAllChatRooms();
        this.allChatRooms$.next(chatRooms);
    }

    /* Rejoint une chatRoom et charge son historique */
    async joinChatRoom(roomId: string): Promise<void> {
        if (this.activeChatRoomId$.value === roomId) return;

        if (this.joinedChatRooms$.getValue().some(r => r.id == roomId)) {
            this.setJoinedRoomToCurrentChatRoom(roomId);
            //this.setParticipantOfJoinedRoom(roomId);
        } else {
            await this.messagingService.joinChatRoom(roomId)
                .then(chatMessage => {
                    // Ajout de la room aux chats rejoins
                    this.addRoomToJoinedRoom(roomId);

                    // Mise à jour des messages
                    this.updateFullMessageHistory(roomId, chatMessage);
                    this.activeChatRoomId$.next(roomId);
                })
                .catch((error) => {
                    console.log("Impossible de rejoindre la room, une erreur est survenue :", error.message)
                    // TODO notification la salle est innacessible, filtrer en cas de room qui n'existe plus
                    // on affiche un message comme quoi la salle n'existe plus et qu'elle va être supprimée, puis la supprimer
                    // this.notificationService.showNotification("Le chat n'a pu être rejoins.", "error", 3000);

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

    // Récupère les utilisateurs qui écrivent
    public getUserTyping$(): Observable<string> {
        return this.userTypingSubject$.asObservable();
    }

    // Récupère tous les chats rejoins par l'utilsateur
    public getJoinedChatRooms$(): Observable<ChatRoom[]> {
        return this.joinedChatRooms$.asObservable();
    }

    // Récupère les chats
    public getAllChatRooms$(): Observable<ChatRoom[]> {
        return this.allChatRooms$.asObservable();
    }

    // Récupère les messages du chat Room en fonction du active chatRoom
    public getMessagesHistoryOfCurrentChatRoom$(): Observable<ChatMessage[]> {
        return combineLatest([
            this.messagesHistoryByChatRoom$,
            this.activeChatRoomId$
        ]).pipe(
            map(([messagesMap, activeRoomId]) => messagesMap.get(activeRoomId ?? " ") || [])
        );
    }

    // Récupère les messages du chat Room
    public getParticipants$(): Observable<User[]> {
        return this.participants$.asObservable();
    }

    /* Gestion de la réception des messages  */
    private handleNewMessage(message: ChatMessage) {
        this.addMessageToChatRoom(message.roomId, message);
    }

    // handler création d'un chatRoom
    private handleCreateChatRoom(chatRoom: ChatRoom) {
        this.addNewRoomToAllAvailableRoom(chatRoom);
    }

    // Handler pour un utilisateur qui rejoins
    private handleUserJoinChatRoom(chatRoomId: string, user: UserDto) {
        this.addUserToJoinedRoom(chatRoomId, [user])
    }

    //Handler pour un utilisateur qui quitte
    private handleUserLeaveChatRoom(chatRoomId: string, user: UserDto) {
        this.removeUserFromJoinedRoom(chatRoomId, user);
    }

    //Handler pour un utilisateur qui quitte
    private handleUserIsTyping(chatRoomId: string, user: UserDto) {
        if (this.activeChatRoomId$.getValue() == chatRoomId) {
            this.userTypingSubject$.next(formatUserName(user));
        }
    }

    /* Gestion des messages */

    public async sendMessage(message: string) {
        if (this.activeChatRoomId$.value == null) return;
        try {
            await this.messagingService.sendMessage(this.activeChatRoomId$.value, message)
        } catch (error) {
            // TODO notification message d'erreur
            console.log("Erreur lors de l'envoie du message :", message, error)
        }
    }

    public async sendUserIsTyping(chatRoomId: string) {

        await this.messagingService.sendUserIsTyping(chatRoomId)

    }

    private addMessageToChatRoom(chatRoomId: string, chatMessage: ChatMessage) {
        if (!this.joinedChatRooms$.getValue().some(r => r.id == chatRoomId)) return;

        const messagesHistoryToUpdate = new Map(this.messagesHistoryByChatRoom$.getValue());
        const messages = messagesHistoryToUpdate.get(chatRoomId) || [];
        messagesHistoryToUpdate.set(chatRoomId, [...messages, chatMessage]);

        this.messagesHistoryByChatRoom$.next(messagesHistoryToUpdate);
    }

    // Ajout d'une nouvelle salle dans les chatRooms disponibles
    private addNewRoomToAllAvailableRoom(chatRoom: ChatRoom) {
        const allRooms = this.allChatRooms$.getValue();
        this.allChatRooms$.next([...allRooms, chatRoom]);
    }

    // Ajouter la salle à la liste des salles rejointes
    private addRoomToJoinedRoom(roomId: string) {
        const allRooms = this.allChatRooms$.getValue();
        const room = allRooms.find(r => r.id === roomId);
        if (room) {
            const joinedRooms = this.joinedChatRooms$.getValue();
            if (!joinedRooms.some(r => r.id === roomId)) {
                this.joinedChatRooms$.next([...joinedRooms, room]);
            } else console.log("La salle est déjà présente dans la liste des chatRejoins")
        } else {
            // En prévention d'un état anormal
            this.removeChatRoomFromJoinedRooms(roomId)

            //Notif
            //throw new Error("La salle que vous essayer de rejoindre n'est pas dans la liste des chats disponibles. Celle ci va être supprimée de la liste")
        }
    }



    // Supprime un chatRoom des chat rejoins
    private removeChatRoomFromJoinedRooms(roomId: string) {
        const joinedRoom = this.joinedChatRooms$.getValue()
        if (!joinedRoom.some(r => r.id == roomId)) return;

        const updatedJoinedRooms = joinedRoom.filter(room => room.id !== roomId);
        this.joinedChatRooms$.next(updatedJoinedRooms);

        // Suppression de l'historique
        const currentMapHistory = this.messagesHistoryByChatRoom$.getValue();
        if (currentMapHistory.has(roomId)) {
            const updatedHistory = new Map(currentMapHistory);
            updatedHistory.delete(roomId);
            this.messagesHistoryByChatRoom$.next(currentMapHistory);
        }
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
    private updateFullMessageHistory(roomId: string, messages: ChatMessage[]) {
        const messagesMap = new Map(this.messagesHistoryByChatRoom$.getValue());
        messagesMap.set(roomId, messages);
        this.messagesHistoryByChatRoom$.next(messagesMap);
    }


    // Ajoute un participant
    private addUserToJoinedRoom(chatRoomId: string, users: UserDto[]) {
        const joinedRooms = this.joinedChatRooms$.getValue();
        const chatRoom = joinedRooms.find(r => r.id === chatRoomId);
        var hasChanged = false;
        if (chatRoom) {
            const updatedParticipants = [...chatRoom.participants];

            // Pour chaque utilisateur passé en entrée
            users.forEach(user => {
                const userAlreadyAdded = updatedParticipants.some(u => u.id === user.id);
                if (!userAlreadyAdded) {
                    hasChanged = true;
                    updatedParticipants.push(user);
                }
            });

            // Si la liste des participants a changé, mettre à jour la room
            if (hasChanged) {
                const updatedRooms = joinedRooms.map(room =>
                    room.id === chatRoomId
                        ? { ...room, participants: updatedParticipants }
                        : room
                );
                this.joinedChatRooms$.next(updatedRooms);
            }
        }
    }

    //  Supprime un participant des salles rejointes
    private removeUserFromJoinedRoom(chatRoomId: string, user: UserDto) {
        const joinedRooms = this.joinedChatRooms$.getValue();
        const chatRoom = joinedRooms.find(r => r.id === chatRoomId);
        if (chatRoom) {
            // Filtrer la liste des participants pour supprimer celui avec l'id spécifié
            const updatedParticipants = chatRoom.participants.filter(u => u.id !== user.id);

            // Si la liste des participants a changé, mettre à jour la room
            if (updatedParticipants.length !== chatRoom.participants.length) {
                const updatedRooms = joinedRooms.map(room =>
                    room.id === chatRoomId
                        ? { ...room, participants: updatedParticipants }
                        : room
                );
                this.joinedChatRooms$.next(updatedRooms);
            }
        }
    }

    private setParticipantOfJoinedRoom(roomId: string) {
        const joinedRooms = this.joinedChatRooms$.getValue();
        const chatRoom = joinedRooms.find(r => r.id === roomId);
        if (chatRoom) {
            console.log("participants", chatRoom.participants)
            //this.participants$.next(chatRoom.participants);
        }
    }

}
