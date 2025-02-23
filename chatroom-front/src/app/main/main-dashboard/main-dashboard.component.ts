import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIconComponent, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { saxCardsBulk, saxBuildingsBulk } from '@ng-icons/iconsax/bulk';
import { bootstrapArrowDown, bootstrapArrowUp } from '@ng-icons/bootstrap-icons';

import { AccountService } from 'src/app/_common/services/account/account.service';
import { ChatRoom } from 'src/app/_common/models/chat-room.model';
import { ChatButtonGroupComponent } from '../../_common/components/chat-button-group/chat-button-group.component';

import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { SITEMAP } from 'src/app/_common/sitemap';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatSvgIconComponent } from '../../_common/components/chat-svg-icon/chat-svg-icon.component';
import { User } from 'src/app/_common/models/user.model';

import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
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
  public chatrooms: ChatRoom[] = [];
  public isCreateChatRoomPopupOpen = false;
  public newChatRoomName = '';
  private readonly chatService = inject(MessagingService);

	private readonly _accountSvc = inject(AccountService);
	public readonly sitemap = SITEMAP;
	public readonly user = computed<User | null>(this._accountSvc.user);

	public viewSelected: number = 1;

  private readonly router = inject(Router);

  constructor() {}

    ngOnInit(): void {
    this.chatService.getChatRooms().then(chatRooms => {
      this.chatrooms = chatRooms;
    });
  }
  
  public openCreateChatRoomPopup(): void {
    this.isCreateChatRoomPopupOpen = true;
  }
  
  public closeCreateChatRoomPopup(): void {
    this.isCreateChatRoomPopupOpen = false;
    this.newChatRoomName = '';
  }
  
  public joinChatRoom(roomId: string): void {
    this.router.navigate(['/chatroom', roomId]);
  }
  
  public createChatRoom(): void {
    if (this.newChatRoomName.trim()) {
        this.chatService.createChatRoom(this.newChatRoomName).then(chatRoom => {
        this.chatrooms.push(chatRoom);
        this.closeCreateChatRoomPopup();
      });
    }
  }

}


