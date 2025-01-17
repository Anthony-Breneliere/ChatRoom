import { UserDto } from "./user.dto";
import { ChatMessage } from "../models/chat-message.model";

export interface ChatRoomDto {
	id: string;
	participants: UserDto[];
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
	readOnly: boolean;
}
