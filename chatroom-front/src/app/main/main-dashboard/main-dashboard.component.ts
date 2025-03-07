import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIconComponent, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { saxCardsBulk, saxBuildingsBulk } from '@ng-icons/iconsax/bulk';
import { bootstrapArrowDown, bootstrapArrowUp } from '@ng-icons/bootstrap-icons';

import { User } from 'src/app/_common/models/user.model';
import { AccountService } from 'src/app/_common/services/account/account.service';

import { ChatButtonGroupComponent } from '../../_common/components/chat-button-group/chat-button-group.component';
import { MHPButton } from 'src/app/_common/components/chat-button-group/chat-button.interface';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { SITEMAP } from 'src/app/_common/sitemap';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatSvgIconComponent } from '../../_common/components/chat-svg-icon/chat-svg-icon.component';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';

@Component({
	selector: 'app-main-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		NgIconComponent,
		ChatButtonGroupComponent,
		ChatButtonComponent,
		ChatSvgIconComponent,
	],
	providers: [
		provideIcons({
			bootstrapArrowUp,
			bootstrapArrowDown,
			saxCardsBulk,
			saxBuildingsBulk,
		}),
		provideNgIconsConfig({ size: '1.5rem' }),
	],
	styleUrl: './main-dashboard.component.scss',
	templateUrl: './main-dashboard.component.html',
})
export class MainDashboardComponent implements OnInit {
	private readonly _accountSvc = inject(AccountService);
	private readonly _serviceMessage = inject(MessagingService);

	public readonly sitemap = SITEMAP;

	public readonly user = computed<User | null>(this._accountSvc.user);

	public readonly buttons: MHPButton<number>[] = [
		{ text: 'Requests', value: 1 },
		// { text: 'Products', value: 2 },
	];

	public viewSelected: number = 1;

	constructor() {}

	Chatrooms!: ChatRoom[];

	createChatroom(): void {
		this._serviceMessage.createChatRoom().then(c => console.log(c));
	}

	ngOnInit(): void {
		this._serviceMessage.getChatRooms().then(c => (this.Chatrooms = c));
	}
}
