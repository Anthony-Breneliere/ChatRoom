import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-message.component.html',
  styleUrl: './notification-message.component.scss'
})
export class NotificationMessageComponent {
	@Input() message: string | null = null;
	public closeNotification() {
		this.message = null;
	}

}
