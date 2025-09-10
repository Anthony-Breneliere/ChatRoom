import { Component } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `

    <div>
      <h3>Créer un salon</h3>
      <div style="display: flex; gap: 0.5rem; justify-content: center;">
        <input [(ngModel)]="newRoomName" placeholder="Nom du salon..." style="flex:1;"/>
        <button type="button" (click)="addRoom()" [disabled]="!newRoomName.trim()">Créer</button>
      </div>
    </div>
    <div style="margin-top:2rem;">
      <h3>Salons de discussion</h3>
      <ul *ngIf="rooms.length > 0; else noRoom" style="list-style: none; padding: 0;">
        <li *ngFor="let room of rooms" style="margin-bottom: 0.5rem;">
          <button type="button" (click)="joinRoom(room)" style="width: 100%; text-align: left;">
            {{ room.name }}
          </button>
        </li>
      </ul>
      <ng-template #noRoom>
        <p>Aucun salon pour le moment. Créez-en un !</p>
      </ng-template>
    </div>
  `
})
export class RoomListComponent {
  rooms: Room[] = [];
  newRoomName = '';

  constructor(private roomService: RoomService, private router: Router) {
    this.roomService.getRooms().subscribe(rooms => this.rooms = rooms);
  }

  addRoom() {
    const name = this.newRoomName.trim();
    if (name) {
      this.roomService.createRoom(name);
      this.newRoomName = '';
    }
  }

  joinRoom(room: Room) {
    this.router.navigate(['/chatroom', room.id]);
  }
}