import { Component, computed, inject, signal, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { ChatRoom } from "../../_common/models/chat-room.model"
import type { ChatMessage } from "../../_common/models/chat-message.model"
import { MessagingService, RoomUserTuple } from "../../_common/services/messaging/messaging.service"
import { FormsModule } from "@angular/forms"
import type { User } from "src/app/_common/models/user.model"
import { AccountService } from "src/app/_common/services/account/account.service"
import { UserDto } from "src/app/_common/dto/user.dto"

@Component({
  selector: "app-chat-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./main-index.component.html",
  styleUrls: ["./main-index.component.scss"],
})
export class MainIndexComponent implements OnInit {
  private readonly _accountSvc = inject(AccountService)
  public readonly user = computed<User | null>(this._accountSvc.user)

	availableChatRooms = signal<ChatRoom[]>([]);
  joinedChatRooms = computed<ChatRoom[]>(() => {
		console.log("joinedChatRooms has been updated")
		return this.availableChatRooms().filter((r) => r.participants.some((p) => p.id === this.user()?.id))
	});

  newMessageContents: { [roomId: string]: string } = {}
  newChannelName = ""
  writingUsers: { [roomId: string]: string | null } = {}

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.loadChatRooms()

    this.messagingService.newChatRoom$.subscribe((room) => {
      this.handleNewChatRoom(room)
    })

    this.messagingService.updateChatRoomParticipant$.subscribe((room) => {
      this.handleUpdateChatRoomParticipant(room)
    })

    this.messagingService.newMessage$.subscribe((message) => {
      this.handleNewMessage(message)
    })

    this.messagingService.userWriting$.subscribe(([room, user]: RoomUserTuple) => {
      this.handleUserWriting(room, user)
    })
  }

  async loadChatRooms() {
    this.availableChatRooms.set(await this.messagingService.getChatRooms())
  }

  async joinChatRoom(room: ChatRoom) {
    if (!this.joinedChatRooms().some((r) => r.id === room.id)) {
      await this.messagingService.joinChatRoom(room.id, this.user()?.id ?? "")
      this.newMessageContents[room.id] = ""
      this.writingUsers[room.id] = null
    }
  }

  async leaveChatRoom(room: ChatRoom) {
    try {
      await this.messagingService.leaveChatRoom(room.id, this.user()?.id ?? "")
      delete this.newMessageContents[room.id]
      delete this.writingUsers[room.id]
    } catch (error) {
      console.error("Error leaving chat room:", error)
    }
  }

  sendMessage(room: ChatRoom) {
    const content = this.newMessageContents[room.id]
    if (!content || !content.trim()) return

    this.messagingService.sendMessage(room.id, this.user()?.id ?? "", content)

    this.newMessageContents[room.id] = ""
    this.writingUsers[room.id] = null // Clear the writing indicator
  }

  async createChannel() {
    if (!this.newChannelName.trim()) return

    var newChannel = await this.messagingService.createChatRoom(this.newChannelName, this.user()?.id ?? "")
    this.newChannelName = ""
  }

  async loadChatHistory(room: ChatRoom) {
    try {
      const history = await this.messagingService.getChatRoomHistory(room.id)
      room.messages = history
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  getDisplayParticipants(participants: UserDto[]): string {
    if (participants.length <= 3) {
      return participants.map((p) => `${p.firstName} ${p.lastName}`).join(", ")
    } else {
      const displayedParticipants = participants
        .slice(0, 3)
        .map((p) => `${p.firstName} ${p.lastName}`)
        .join(", ")
      const remainingCount = participants.length - 3
      return `${displayedParticipants} + ${remainingCount}`
    }
  }

	private handleNewChatRoom(room: ChatRoom) {
		this.availableChatRooms.update((rooms) => {
			if (!rooms.some((r) => r.id === room.id)) {
				rooms.push(room);
			}

			return rooms;
		});
	}

	private handleUpdateChatRoomParticipant(room: ChatRoom) {
		console.log("handleUpdateChatRoomParticipant");

		this.availableChatRooms.update((rooms) => {
			return rooms.map((r) =>
				r.id === room.id ? { ...r, participants: [...room.participants] } : r
			);
		});
	}

	private handleNewMessage(message: ChatMessage) {
		this.availableChatRooms.update((rooms) => {
			return rooms.map((r) =>
				r.id === message.roomId ? { ...r, messages: [...r.messages, message] } : r
			);
		});
	}

  private handleUserWriting(room: ChatRoom, user: UserDto) {
    if (user.id !== this.user()?.id) {
      this.writingUsers[room.id] = `${user.firstName} ${user.lastName}`
      setTimeout(() => {
        this.writingUsers[room.id] = null
      }, 1000)
    }
  }

  onUserTyping(roomId: string) {
    this.messagingService.userWriteInChatRoom(roomId, this.user()?.id ?? "")
  }
}
