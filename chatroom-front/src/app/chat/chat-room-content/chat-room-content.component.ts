import { Component, ElementRef, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, map, Subscription, tap, } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { MessagingManagerService } from 'src/app/_common/services/messaging/messaging.manager.service';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-room-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room-content.component.html',
  styleUrl: './chat-room-content.component.scss'
})
export class ChatRoomContentComponent {

  @ViewChild('message-input') messageInput!: ElementRef;

  public messageHistory$: Observable<ChatMessage[]>
  private _userIsWriting: boolean = false;

  private _userWriteSubscription!: Subscription;



  // Service de chat
  private _chatManagerService: MessagingManagerService

  constructor(chatManagerService: MessagingManagerService) {
    this._chatManagerService = chatManagerService;
    this.messageHistory$ = this._chatManagerService.messageHistory$;
  }



  ngOnInit(): void {
    this._userWriteSubscription = fromEvent(this.messageInput.nativeElement, 'input').pipe(
      debounceTime(1000),  // Attendre 1 seconde d'inactivité avant d'envoyer l'événement "UserWriting"
      map((event: any) => event.target.value),
      tap((text: string) => {
        // Envoi du message "UserWriting" lorsqu'on commence à taper
        if (text.trim()) {
          console.log("Envoie du message qu'on est en train d'ecrire toutes les X secondes: ", text)

          // Envoyer que l'utilisateur écrit
        }
      })
    ).subscribe();
  }


  ngOnDestroy(): void {
    if (this._userWriteSubscription) {
      this._userWriteSubscription.unsubscribe();
    }
  }

  sendMessage() {
    const message = this.messageInput.nativeElement.value.trim();
    if (message) {
      console.log("Envoi du message :", message)
      this._chatManagerService.sendMessage(message);
      this.messageInput.nativeElement.value = '';  // Effacer l'input après l'envoi du message
    }
  }

  onKeyUp(event: KeyboardEvent) {
    console.log("pressKey : ", event.key);
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

}
