// src/features/messages/index.ts
export { MessagesSection } from './ui/MessagesSection';
export { messagesStore } from './model/messagesStore';
export { messagesUnreadStore } from './model/messagesUnreadStore';
export { getMessagesViewerFromUser } from './model/messagesViewer';
export type {
  ChatMessage,
  MessageThread,
  MessageParticipantRole,
  MessageThreadKind,
  MessagesViewer,
  MessagesUnreadSummary,
} from './model/types';
