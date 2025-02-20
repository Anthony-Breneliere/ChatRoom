import { Component } from '@angular/core';
import { MyNotification, NotificationService } from '../_common/services/notification/notification.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {

  public notification$!: Observable<MyNotification | null>;

  constructor(private notificationService: NotificationService) {
    this.notification$ = this.notificationService.notification$
  }

  ngOnInit(): void { }
}
