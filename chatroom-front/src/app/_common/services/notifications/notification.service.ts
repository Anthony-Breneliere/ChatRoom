import { computed, inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';
import { AccountService } from '../account/account.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSource = new BehaviorSubject<string[]>([]);
  currentNotifications = this.notificationSource.asObservable();
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
  private newUsersSource = new BehaviorSubject<{ roomId: string, message: string }[]>([]);
  newUsers$ = this.newUsersSource.asObservable();
	private typingMessage: { roomId: string, message: string } | null = null;
	private typingTimeout: any;
  constructor() {}

  setNewUserMessage(roomId: string, message: string): void {
    const currentMessages = this.newUsersSource.value;
    this.newUsersSource.next([...currentMessages, { roomId, message }]);

    setTimeout(() => {
      this.clearUserMessage(roomId, message);
    }, 3000);
  }


	clearUserMessage(roomId: string, message: string): void {
    const updatedMessages = this.newUsersSource.value.filter(
      (notif) => !(notif.roomId === roomId && notif.message === message)
    );
    this.newUsersSource.next(updatedMessages);
  }

	clearMessagesForRoom(roomId: string): void {
    const updatedMessages = this.newUsersSource.value.filter(
      (notif) => notif.roomId !== roomId
    );
    this.newUsersSource.next(updatedMessages);
  }

  sendNotification(message: string): void {
    const currentNotifications = this.notificationSource.value;

    if (currentNotifications.length >= 5) {
      currentNotifications.shift();
    }

    currentNotifications.push(message);

    this.notificationSource.next([...currentNotifications]);

    setTimeout(() => {
      this.clearNotification(message);
    }, 3000);
  }

  clearNotification(message: string): void {
    const updatedNotifications = this.notificationSource.value.filter(
      (notif) => notif !== message
    );
    this.notificationSource.next(updatedNotifications);
  }

	setUserTyping(roomId: string, user: User): void {
		if (user.id != this.user()?.id){
			const message = `${user.firstName} est en train d'écrire...`;
			this.typingMessage = { roomId, message };
			if (this.typingTimeout) {
				clearTimeout(this.typingTimeout);
			}

			this.typingTimeout = setTimeout(() => {
				this.typingMessage = null;
			}, 1000);
		}
	}

	getUserTypingMessage(): { roomId: string, message: string } | null {
		return this.typingMessage;
	}
}
