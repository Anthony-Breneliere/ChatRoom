import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageListComponent } from '../message-list/message-list.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { UserListComponent } from '../user-list/user-list.component';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [MessageListComponent, MessageInputComponent, UserListComponent],
  template: `
    <button (click)="goHome()" style="margin-bottom: 1rem;">Quitter le salon</button>
    <h2>Chatroom : {{ roomId }}</h2>
    <app-message-list [roomId]="roomId"></app-message-list>
    <app-message-input [roomId]="roomId"></app-message-input>
    <app-user-list></app-user-list>
  `
})
export class ChatroomComponent {
  roomId = '';
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(params => {
      this.roomId = params['id'];
    });
  }

  goHome() {
    this.router.navigate(['/']); 
  }
}