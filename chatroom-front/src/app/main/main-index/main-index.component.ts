import { Component, computed, inject, Signal } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { AccountService } from 'src/app/_common/services/account/account.service';
import { User } from 'src/app/_common/models/user.model';
import { SITEMAP } from 'src/app/_common/sitemap';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent, RouterModule],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
	public readonly sitemap = SITEMAP;
}
