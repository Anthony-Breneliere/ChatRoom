export interface ChatMessage {
	id: string;
	roomId: string;
	authorId: string;
	authorFullName: string;
	authorCompanyId: number;
	authorCompanyName: string;
	content: string;
	sender: string;
	createdAt: Date;
	updatedAt: Date;
}
