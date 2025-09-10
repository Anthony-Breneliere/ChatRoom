import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private users$ = new BehaviorSubject<User[]>([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' }
  ]);

  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

}