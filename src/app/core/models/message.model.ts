import { User } from './user.model';

export interface Attachment {
  fileUrl: string;
  fileName?: string;
  contentType: string;
  fileSize: number;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface ReplyInfo {
  messageId: string;
  content?: string;
  senderName: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  sender: User;
  content?: string;
  messageType: 'Text' | 'Image' | 'File' | 'Voice';
  sentAt: Date;
  editedAt?: Date;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyToMessageId?: string;
  replyToMessage?: ReplyInfo;
  forwardedFrom?: User;
  attachments: Attachment[];
  reactionCounts: { [key: string]: number };
  currentUserReaction?: string;
  readCount: number;
  totalParticipants: number;
}

export interface SendMessageDto {
  conversationId: string;
  content?: string;
  messageType: string;
  replyToMessageId?: string;
}