import { UserDto } from '../dto/user.dto';

export interface ChatMessage {
	id: string;
	roomId: string;
	authorId: string;
	author: UserDto;
	authorFullName: string;
	authorCompanyId: number;
	authorCompanyName: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	isSystemMessage?: boolean;
}
