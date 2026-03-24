// src/features/messages/model/buildMessagesChatLink.ts
type BuildMessagesChatLinkParams = {
  specialistId: string;
  specialistSlug: string;
  specialistName: string;
  specialistAvatarUrl?: string;
};

export function buildMessagesChatLink(params: BuildMessagesChatLinkParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set('specialistId', params.specialistId.trim());
  searchParams.set('specialistSlug', params.specialistSlug.trim());
  searchParams.set('specialistName', params.specialistName.trim());

  if (params.specialistAvatarUrl?.trim()) {
    searchParams.set('specialistAvatarUrl', params.specialistAvatarUrl.trim());
  }

  return `/messages?${searchParams.toString()}`;
}

type BuildClientChatLinkParams = {
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
};

export function buildClientChatLink(params: BuildClientChatLinkParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set('clientId', params.clientId.trim());
  searchParams.set('clientName', params.clientName.trim());

  if (params.clientAvatarUrl?.trim()) {
    searchParams.set('clientAvatarUrl', params.clientAvatarUrl.trim());
  }

  return `/messages?${searchParams.toString()}`;
}
