import { Component, computed, inject, Input } from '@angular/core';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { User } from '../_common/models/user.model';
import { AccountService } from '../_common/services/account/account.service';
import { ChatMessage } from '../_common/models/chat-message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-details.component.html',
  styleUrl: './message-details.component.scss'
})
export class MessageDetailsComponent {
	@Input() message!: ChatMessage;

	constructor(private readonly _messagingSvc: MessagingService) {}

	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);

	public formatFrenchDate(isoDate: Date): string {
		const date = new Date(isoDate);
		const today = new Date();

		const isToday =
			date.toDateString() === today.toDateString();

		return isToday
			? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
			: date.toLocaleDateString("fr-FR", { year: "numeric", month: "numeric", day: "numeric" });
	}

	public isMessageSendFromUser(){
		return this.message.authorId === this.user()?.id;
	}

}
