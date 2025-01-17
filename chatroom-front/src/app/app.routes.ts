import { Routes } from '@angular/router';

import { SITEMAP } from './_common/sitemap';

import { isAdminGuard } from './_common/guards/is-admin/is-admin.guard';
import { isAuthenticatedGuard } from './_common/guards/is-authenticated/is-authenticated.guard';
import { isNotAuthenticatedGuard } from './_common/guards/is-not-authenticated/is-not-authenticated.guard';

import { MainComponent } from './main/main.component';
import { MainIndexComponent } from './main/main-index/main-index.component';
import { MainAccountComponent } from './main/main-account/main-account.component';
import { MainDashboardComponent } from './main/main-dashboard/main-dashboard.component';

import { AdminComponent } from './admin/admin.component';
import { AdminIndexComponent } from './admin/admin-index/admin-index.component';

import { AuthComponent } from './auth/auth.component';
import { AuthIndexComponent } from './auth/auth-index/auth-index.component';
import { AuthLoginComponent } from './auth/auth-login/auth-login.component';

import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { ChanelListComponent } from './chanel-list/chanel-list.component';

export const routes: Routes = [
	{
		path: SITEMAP.main.path,
		component: MainComponent,
		children: [
			{
				path: '',
				component: MainIndexComponent,
			},
			{
				path: SITEMAP.account.path,
				canActivate: [isAuthenticatedGuard],
				component: MainAccountComponent,
			},
			{
				path: SITEMAP.dashboard.path,
				canActivate: [isAuthenticatedGuard],
				component: MainDashboardComponent,
			}
		],
	},

	{
		path: SITEMAP.admin.path,
		canActivate: [isAdminGuard],
		component: AdminComponent,
		children: [{ path: '', component: AdminIndexComponent }],
	},

	{
		path: SITEMAP.auth.path,
		canActivate: [isNotAuthenticatedGuard],
		component: AuthComponent,
		children: [
			{ path: '', component: AuthIndexComponent },
			{ path: SITEMAP.login.path, component: AuthLoginComponent },
		],
	},

	{ path: SITEMAP.maintenance.path, component: MaintenanceComponent },
	{ path: SITEMAP.forbidden.path, component: ForbiddenComponent },
	{ path: SITEMAP.unauthorized.path, component: UnauthorizedComponent },
	{path : SITEMAP.chanels.path, component: ChanelListComponent},
	{ path: '**', component: NotFoundComponent },
];
