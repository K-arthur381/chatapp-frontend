import { User } from './user.model';
import { Message } from './message.model';

export interface Conversation {
  conversationId: string;
  type: 'Private' | 'Group';
  groupName?: string;
  groupAvatarUrl?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}