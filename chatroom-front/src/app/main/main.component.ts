import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SITEMAP } from '../_common/sitemap';

import { MainHeaderComponent } from './main-header/main-header.component';
import { NotificationService } from '../_common/services/notifications/notification.service';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-main',
	standalone: true,
	imports: [RouterModule, MainHeaderComponent, NotificationMessageComponent, CommonModule],
	styleUrl: './main.component.scss',
	templateUrl: './main.component.html',
})
export class MainComponent {
	constructor(private readonly _notificationSvc: NotificationService) {}
	notifications: string[] = [];

	ngOnInit() {
    this._notificationSvc.currentNotifications.subscribe(notifications => {
      this.notifications = notifications;
    });
	}

  calculateTopPosition(index: number): string {
    const initialOffset = 85;
		return `${initialOffset + index * 110}px`;
  }
}
