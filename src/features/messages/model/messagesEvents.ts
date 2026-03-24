// src/features/messages/model/messagesEvents.ts
export const MESSAGES_UPDATED_EVENT = 'tailly:messages-updated';

export function emitMessagesUpdated(): void {
  window.dispatchEvent(new CustomEvent(MESSAGES_UPDATED_EVENT));
}
