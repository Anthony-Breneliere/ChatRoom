import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Room } from '../models/room';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private rooms$ = new BehaviorSubject<Room[]>([]); // <-- Liste vide au départ

  getRooms(): Observable<Room[]> {
    return this.rooms$.asObservable();
  }

  createRoom(name: string) {
    const newRoom: Room = { id: Date.now().toString(), name };
    this.rooms$.next([...this.rooms$.value, newRoom]);
  }
}