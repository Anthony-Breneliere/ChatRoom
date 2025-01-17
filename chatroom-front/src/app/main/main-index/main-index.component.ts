import { Component, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { ChatSvgLogoComponent } from '../../_common/components/chat-svg-logo/chat-svg-logo.component';
import { ChatButtonComponent } from '../../_common/components/chat-button/chat-button.component';
import { fromEvent, debounceTime, distinctUntilChanged, switchMap, of, Observable, map } from 'rxjs';


@Component({
	selector: 'app-main-index',
	standalone: true,
	imports: [ChatSvgLogoComponent, ChatButtonComponent],
	styleUrl: './main-index.component.scss',
	templateUrl: './main-index.component.html',
})
export class MainIndexComponent {



	@ViewChild('searchBar') input!: ElementRef<HTMLInputElement>;

}
