import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoom } from '../../_common/models/chat-room.model';

@Component({
  selector: 'app-chat-room-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room-item.component.html',
  styleUrl: './chat-room-item.component.scss'
})
export class ChatRoomItemComponent {
  // 🔹 Paramètre d'entrée (Input) que prend le composant
  @Input() chatRoom?: ChatRoom;
  @Output() joinChat: EventEmitter<string> = new EventEmitter<string>();  // EventEmitter pour notifier le parent

  // Envoie l'ID du chat au parent
  onChatClick() {
    this.joinChat.emit(this.chatRoom?.id);
  }
}
