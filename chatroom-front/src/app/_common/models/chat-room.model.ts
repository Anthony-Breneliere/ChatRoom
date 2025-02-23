// import { Company } from './company.model';
import { ChatMessageDto as ChatMessage } from './chat-message.model';

export interface ChatRoom {
	id: string;
	name: string;
	participants: [];
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
	readOnly: boolean;
}
