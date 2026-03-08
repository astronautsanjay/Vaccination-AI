
export enum MessageRole {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
}
