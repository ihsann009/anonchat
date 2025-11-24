export interface Topic {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  messageCount?: number;
  closed?: boolean;
  ownerId?: string;
  ownerName?: string;
}

export interface Message {
  id: string;
  topicId: string;
  text: string;
  senderId: string;
  timestamp: number;
}

export interface User {
  id: string;
  isGuest: boolean;
}
