export interface ChatMessageDto {
  id: string;
  roomId: string;
  authorId: string;
  authorFullName: string;
  authorCompanyId: number;
  authorCompanyName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

