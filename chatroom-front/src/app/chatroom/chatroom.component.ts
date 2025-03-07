import { Component } from '@angular/core';
import { ChatButtonComponent } from '../_common/components/chat-button/chat-button.component';
import { ChatButtonGroupComponent } from '../_common/components/chat-button-group/chat-button-group.component';
import { ChatFileUploaderComponent } from '../_common/components/chat-file-uploader/chat-file-uploader.component';
// import { ChatFromToComponent } from '../_common/components/chat-from-to/chat-from-to.component';
import { ChatInputComponent } from '../_common/components/chat-input/chat-input.component';
import { ChatLabelComponent } from '../_common/components/chat-label/chat-label.component';
import { ChatLoaderComponent } from '../_common/components/chat-loader/chat-loader.component';
import { ChatModalComponent } from '../_common/components/chat-modal/chat-modal.component';
import { ChatSuggestionsCard } from '../_common/components/chat-new-request-button/chat-suggestions-card.component';
import { ChatNotificationComponent } from '../_common/components/chat-notification/chat-notification.component';
// import { ChatPackageComponent } from '../_common/components/chat-package/chat-package.component';
import { ChatProgressbarComponent } from '../_common/components/chat-progressbar/chat-progressbar.component';
// import { ChatStatusLabelComponent } from '../_common/components/chat-status-label/chat-status-label.component';
import { ChatSvgIconComponent } from '../_common/components/chat-svg-icon/chat-svg-icon.component';
import { ChatSvgLogoComponent } from '../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatSwitchComponent } from '../_common/components/chat-switch/chat-switch.component';
import { ChatTabsComponent } from '../_common/components/chat-tabs/chat-tabs.component';
import { ChatThemeSwitchComponent } from '../_common/components/chat-theme-switch/chat-theme-switch.component';
import { ChatViewSwitchComponent } from '../_common/components/chat-view-switch/chat-view-switch.component';

@Component({
	selector: 'app-chatroom',
	standalone: true,
	imports: [
		ChatButtonComponent,
		ChatButtonGroupComponent,
		ChatFileUploaderComponent,
		// ChatFromToComponent,
		ChatInputComponent,
		ChatLabelComponent,
		ChatLoaderComponent,
		ChatModalComponent,
		ChatSuggestionsCard,
		ChatNotificationComponent,
		// ChatPackageComponent,
		ChatProgressbarComponent,
		// ChatStatusLabelComponent,
		ChatSvgIconComponent,
		ChatSvgLogoComponent,
		ChatSwitchComponent,
		ChatTabsComponent,
		ChatThemeSwitchComponent,
		ChatViewSwitchComponent,
	],
	templateUrl: './chatroom.component.html',
	styleUrl: './chatroom.component.scss',
})
export class ChatroomComponent {
	createChatroom(): void {
		alert('Ca fonctionne');
	}
}
