import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/messages';
import { NgFor, DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [NgFor, DatePipe],
  template: `
    <div *ngFor="let msg of messages">
      <b>{{msg.user}}:</b> {{msg.content}} <small>{{msg.timestamp | date:'shortTime'}}</small>
    </div>
  `
})
export class MessageListComponent implements OnInit {
  @Input() roomId!: string;
  messages: Message[] = [];
  constructor(private chat: ChatService) {}
  ngOnInit() {
    this.chat.getMessages(this.roomId).subscribe(msgs => this.messages = msgs);
  }
}