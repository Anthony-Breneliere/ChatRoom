import { UserDto } from '../dto/user.dto';
import { ChatMessage } from './chat-message.model';

export interface ChatRoom {
	name: string;
	id: string;
	participants: UserDto[];
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
	readOnly: boolean;
	userWriting: UserDto | undefined;
}
