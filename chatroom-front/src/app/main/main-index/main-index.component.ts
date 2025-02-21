import { Component, inject, Signal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { ChatRoomComponent } from "../../chat-room/chat-room.component";

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {}
