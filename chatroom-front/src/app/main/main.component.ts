import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SITEMAP } from '../_common/sitemap';

import { MainHeaderComponent } from './main-header/main-header.component';
import { NotificationComponent } from "../notification/notification.component";

@Component({
	selector: 'app-main',
	standalone: true,
	imports: [RouterModule, MainHeaderComponent, NotificationComponent],
	styleUrl: './main.component.scss',
	templateUrl: './main.component.html',
})
export class MainComponent { }
