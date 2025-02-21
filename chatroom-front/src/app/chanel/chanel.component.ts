import { Component, computed, ElementRef, inject, Input, ViewChild  } from '@angular/core';
import { ChatInputComponent } from '../_common/components/chat-input/chat-input.component';
import { MessagingService } from '../_common/services/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_common/services/account/account.service';
import { User } from '../_common/models/user.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chanel',
  standalone: true,
  imports: [ChatInputComponent, CommonModule, FormsModule],
  templateUrl: './chanel.component.html',
  styleUrl: './chanel.component.scss'
})
export class ChanelComponent {
  @ViewChild('discussion') private discussion!: ElementRef;
  @Input() id: string | undefined;
  
  private readonly _accountService = inject(AccountService);
  user$ = computed<User | null>(this._accountService.user);

  message: string = '';
  roomInfo : any

  constructor(private messagingService: MessagingService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.messagingService.joinedRoomsObservable$.subscribe(rooms => {
      console.log(rooms);
      this.roomInfo = rooms.find(room => room.id === this.id);
      console.log(this.roomInfo);
    });
    
    console.log('user', this.user$());
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  leaveChatRoom(){
    this.messagingService.leaveChatRoom(this.id!).subscribe(
      () => {
      },
      (error) => {
        console.error('Erreur lors de la tentative de rejoindre la salle:', error);
      }
    );
  }

  sendMessage() {
    this.messagingService.sendMessage(this.id!, this.message);
  }

  getSanitizedMessage(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content.replace(/\n/g, '<br>'));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
  
    const day = date.getDate().toString().padStart(2, '0');  // Jour avec 2 chiffres
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Mois (1-12)
    const year = date.getFullYear();  // Année (YYYY)
    const hours = date.getHours().toString().padStart(2, '0');  // Heure (00-23)
    const minutes = date.getMinutes().toString().padStart(2, '0');  // Minutes (00-59)
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private scrollToBottom(): void {
    try {
      this.discussion.nativeElement.scrollTop = this.discussion.nativeElement.scrollHeight;
    } catch (err) {
      console.error("Erreur lors du scroll :", err);
    }
  }

}
