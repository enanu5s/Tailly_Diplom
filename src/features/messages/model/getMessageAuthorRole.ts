// src/features/messages/model/getMessageAuthorRole.ts
import type { MessageParticipantRole } from './types';

export function getMessageAuthorRole(role: string | null | undefined): MessageParticipantRole {
  if (role === 'client' || role === 'specialist' || role === 'admin') {
    return role;
  }

  return 'support';
}