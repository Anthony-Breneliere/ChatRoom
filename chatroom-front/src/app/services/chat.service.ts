import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/messages';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private messagesByRoom: { [roomId: string]: BehaviorSubject<Message[]> } = {};

  getMessages(roomId: string): Observable<Message[]> {
    if (!this.messagesByRoom[roomId]) {
      this.messagesByRoom[roomId] = new BehaviorSubject<Message[]>([]);
    }
    return this.messagesByRoom[roomId].asObservable();
  }

  sendMessage(roomId: string, user: string, content: string) {
    if (!this.messagesByRoom[roomId]) {
      this.messagesByRoom[roomId] = new BehaviorSubject<Message[]>([]);
    }
    const msg: Message = {
      user,
      content,
      timestamp: new Date()
    };
    this.messagesByRoom[roomId].next([...this.messagesByRoom[roomId].value, msg]);
  }
}