import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { User } from 'src/app/_common/models/user.model';
import { AccountService } from '../_common/services/account/account.service';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { ChatRoom } from '../_common/models/chat-room.model';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-main-create-channel',
  standalone: true,
  templateUrl: './main-create-channel.component.html',
  styleUrl: './main-create-channel.component.scss'
})
export class MainCreateChannelComponent {

	constructor(private readonly _messagingSvc: MessagingService){}
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);

	public async createChannel(){
		var chatRoom : ChatRoom = await this._messagingSvc.createChatRoom();
	}
}
