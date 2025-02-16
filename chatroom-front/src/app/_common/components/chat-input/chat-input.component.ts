import { CommonModule } from '@angular/common';
import { Component, input, model, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import {
	saxAddOutline,
	saxCallOutline,
	saxMinusOutline,
	saxPersonalcardOutline,
	saxProfileCircleOutline,
	saxSmsOutline,
} from '@ng-icons/iconsax/outline';

@Component({
	selector: 'chat-input',
	standalone: true,
	imports: [CommonModule, FormsModule, NgIconComponent],
	providers: [
		provideIcons({
			saxAddOutline,
			saxCallOutline,
			saxMinusOutline,
			saxPersonalcardOutline,
			saxProfileCircleOutline,
			saxSmsOutline,
		}),
		provideNgIconsConfig({ size: '1.5rem' }),
	],
	styleUrl: './chat-input.component.scss',
	templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
	public readonly disabled = input<boolean>(false);
	public readonly max = input<number>();
	public readonly min = input<number>();
	public readonly placeholder = input<string>();
	public readonly prefix = input<string>();
	public readonly step = input<number>(1);
	public readonly stepper = input<boolean>(false);
	public readonly suffix = input<string>();
	public readonly type = input<'date' | 'number' | 'text' | 'textarea'>('text');

	public readonly value = model<string>();

	public decrease(): void {
		this.value.set(
			!(this.type() === 'number') || (typeof this.min === 'number' && +this.value()! <= this.min)
				? `${+this.value()!}`
				: `${+this.value()! - this.step()}`
		);
	}

	public increase(): void {
		this.value.set(
			!(this.type() === 'number') || (typeof this.max === 'number' && +this.value()! >= this.max)
				? `${+this.value()!}`
				: `${+this.value()! + this.step()}`
		);
	}
}
