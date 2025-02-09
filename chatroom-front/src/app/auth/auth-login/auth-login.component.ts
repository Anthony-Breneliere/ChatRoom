import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiAuthService } from 'src/app/_common/services/api/api-auth/api-auth.service';

import { SITEMAP } from 'src/app/_common/sitemap';

@Component({
	selector: 'app-auth-login',
	standalone: true,
	imports: [RouterModule],
	styleUrl: './auth-login.component.scss',
	templateUrl: './auth-login.component.html',
})
export class AuthLoginComponent {
	private readonly _authSvc = inject(ApiAuthService);

	public readonly sitemap = SITEMAP;

	constructor() {}

	public provide(provider: 'Microsoft' | 'Google'): void {
		this._authSvc.getLoginProvider(provider, `${window.location.origin}/dashboard`);
	}
}
