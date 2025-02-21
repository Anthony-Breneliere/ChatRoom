import { inject, Injectable, signal } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessagingService } from 'src/app/_common/services/messaging/messaging.service';

import { SITEMAP } from '../../sitemap';
import { User } from '../../models/user.model';
import { ApiUserService } from '../api/api-user/api-user.service';
import { ApiAuthService } from '../api/api-auth/api-auth.service';

@Injectable({
	providedIn: 'root',
})
export class AccountService {
	private readonly _router = inject(Router);
	private readonly _authSvc = inject(ApiAuthService);
	private readonly _cookieSvc = inject(CookieService);
	private readonly _apiUserSvc = inject(ApiUserService);

	private readonly sitemap = SITEMAP;
	private readonly userKey: string = 'user';

	public readonly user = signal<User | null>(JSON.parse(sessionStorage.getItem(this.userKey)!));

	constructor(private messagingService: MessagingService) {}

	public updateAccount(user: User): void {
		this.user.set(user);
		sessionStorage.setItem(this.userKey, JSON.stringify(user));
	}

	public resetAccount(): void {
		this.user.set(null);
		sessionStorage.removeItem(this.userKey);
	}

	public async checkAuth(): Promise<void> {
		try {
			if (!this.user()) {
				const response: HttpResponse<User> = await this._apiUserSvc.getUser();

				if (response.ok) {
					this.updateAccount(response.body!);
				} else {
					this.resetAccount();
				}
			}
		} catch (err: unknown) {
			this.resetAccount();
		}
	}

	/**
	 * @description Sign out the user from the api server
	 */
	public async signOut(): Promise<void> {
		// Sign out the user from the api server
		const signOutResponse: HttpResponse<string> = await this._authSvc.signOut();
		if (signOutResponse.status !== 200) console.error('Sign out failed with status:', signOutResponse.status);

		// remove access token from cookies
		this._cookieSvc.delete('.AspNetCore.Cookies');

		this.messagingService.leaveChatRooms();

		// reset current logged user from the current service
		this.resetAccount();

		// navigate to the main page
		this._router.navigate([this.sitemap.main.route]);
	}
}
