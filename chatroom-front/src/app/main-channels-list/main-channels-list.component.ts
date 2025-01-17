import { Component, computed, inject } from '@angular/core';
import { User } from 'src/app/_common/models/user.model';
import { AccountService } from '../_common/services/account/account.service';


@Component({
  selector: 'app-main-channels-list',
  standalone: true,
  imports: [],
  templateUrl: './main-channels-list.component.html',
  styleUrl: './main-channels-list.component.scss'
})
export class MainChannelsListComponent {
	private readonly _accountSvc = inject(AccountService);
	public readonly user = computed<User | null>(this._accountSvc.user);
}
