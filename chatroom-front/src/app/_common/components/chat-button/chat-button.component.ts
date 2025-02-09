// noinspection SpellCheckingInspection

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { iconoirRefreshDouble } from '@ng-icons/iconoir';
import {
	saxArrowDown1Outline,
	saxCandleOutline,
	saxAddOutline,
	saxDocumentTextOutline,
	saxSend2Outline,
	saxEyeOutline,
	saxNote2Outline,
	saxImportOutline,
	saxBook1Outline,
	saxBookmark2Outline,
} from '@ng-icons/iconsax/outline';

import * as iconsaxBulk from '@ng-icons/iconsax/bulk';
import * as iconsaxOutline from '@ng-icons/iconsax/outline';
import * as iconoir from '@ng-icons/iconoir';

export type iconsRef = keyof typeof iconsaxBulk | keyof typeof iconsaxOutline | keyof typeof iconoir;

@Component({
	selector: 'chat-button',
	standalone: true,
	imports: [CommonModule, NgIconComponent],
	providers: [
		provideIcons(iconsaxBulk),
		provideIcons(iconsaxOutline),
		provideIcons(iconoir),
		provideNgIconsConfig({ size: '1rem' }),
	],
	styleUrl: './chat-button.component.scss',
	templateUrl: './chat-button.component.html',
})
export class ChatButtonComponent {
	public prefix = input<iconsRef>();
	public suffix = input<iconsRef>();
	public text = input<string>('');
	public type = input<'primary' | 'secondary' | 'tertiary' | 'danger' | 'green'>('primary');
	public size = input<'normal' | 'large'>('normal');
	public disabled = input<boolean>(false);
}
