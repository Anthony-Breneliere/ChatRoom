import { Injectable } from "@angular/core";
import { MessagingService } from "./messaging.service";
import { ChatRoom } from "../../models/chat-room.model";

@Injectable({
    providedIn: 'root',
})

/**
 * Permet de géré l'ensemble des chat déjà rejoins
 */
export class MessagingManagerService {

    private _chatService: MessagingService

    private _activeChatRoomId: string | null = null;
    //private _joinedChatRooms: ChatRoom[]

    constructor(chatService: MessagingService) {
        this._chatService = chatService;

        // souscription pour les nouveaux messages 
        this._chatService.newMessage$.subscribe((message) => {
            console.log('Nouveau message:', message);
            // redirection vers le bon chat sauvegardé s'il est "rejoins"
        })
    }




    sendMessage(message: string) {
        if (!this._activeChatRoomId) {
            return;
        }
        this._chatService.sendMessage(this._activeChatRoomId, message)
    }


}