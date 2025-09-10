import { Component, Input } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="content" placeholder="Votre message..." />
    <button (click)="send()">Envoyer</button>
  `
})
export class MessageInputComponent {
  @Input() roomId!: string;
  content = '';
  constructor(private chat: ChatService) {}
  send() {
    if (this.content.trim()) {
      this.chat.sendMessage(this.roomId, 'Me', this.content);
      this.content = '';
    }
  }
}