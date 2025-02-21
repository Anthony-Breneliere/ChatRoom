import { UserDto } from '../dto/user.dto';
import { ChatMessage } from './chat-message.model';

export interface ChatRoom {
	id: string;
	participants: UserDto[];
	messages: ChatMessage[];
	newMessage: string;
	createdAt: Date;
	updatedAt: Date;
	readOnly: boolean;
	chatName: string;
	user_is_writing: boolean;
	users_writings: string[];
	user_writing_message: string;
}
