import { Component, Input, inject, computed } from '@angular/core';
import { ChatMessage } from 'src/app/_common/models/chat-message.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { User } from 'src/app/_common/models/user.model';
import { format, parseISO, isAfter, differenceInMinutes, isBefore, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
	selector: 'app-main-chat-message',
	standalone: true,
	templateUrl: './main-chat-message.component.html',
	imports: [ReactiveFormsModule],
})
export class MainChatMessageComponent {
	@Input() message!: ChatMessage;
	@Input() onEditMessage?: Function;
	@Input() editing: boolean = false;
	@Input() previousMessage?: ChatMessage;

	_accountSvc = inject(AccountService);

	user = computed<User | null>(this._accountSvc.user);
	isMessageFromCurrentUser = computed(() => this.message.authorId === this.user()?.id);
	isDefferentAuthor = computed(() => this.previousMessage?.authorId !== this.message.authorId);

	isMessageEdited() {
		return this.isDateAfter(this.message.createdAt, this.message.updatedAt);
	}

	shouldMessageHasTime() {
		if (!this.previousMessage) {
			return true;
		}

		const timeDifference = differenceInMinutes(
			parseISO(this.message.createdAt),
			parseISO(this.previousMessage.createdAt)
		);

		return this.isDefferentAuthor() || timeDifference > 10;
	}

	shouldMessageHaveInfo() {
		return this.shouldMessageHasTime() || this.isMessageEdited();
	}

	shouldShowDate(): boolean {
		if (!this.previousMessage) {
			return true;
		}

		const previousDate = startOfDay(parseISO(this.previousMessage.createdAt));
		const currentDate = startOfDay(parseISO(this.message.createdAt));

		return isBefore(previousDate, currentDate);
	}

	getFormattedDate(date: string): string {
		const messageDate = parseISO(date);
		const today = startOfDay(new Date());
		const isToday = isBefore(today, messageDate);

		if (isToday) {
			return "Aujourd'hui";
		}

		const sevenDaysAgo = addDays(new Date(), -7);
		const isBeforeSevenDaysAgo = isBefore(sevenDaysAgo, messageDate);

		return format(messageDate, isBeforeSevenDaysAgo ? 'EEEE' : 'd MMMM yyyy', { locale: fr });
	}

	getTime(date: string): string {
		return format(date, 'HH:mm');
	}

	isDateAfter(date1: string, date2: string): boolean {
		try {
			const dateToCompare = parseISO(date1);
			const date = parseISO(date2);

			return isAfter(date, dateToCompare);
		} catch {
			return false;
		}
	}

	onContextMenu(event: MouseEvent) {
		if (!this.isMessageFromCurrentUser()) {
			return;
		}

		event.preventDefault();

		this.onEditMessage?.();
	}
}
