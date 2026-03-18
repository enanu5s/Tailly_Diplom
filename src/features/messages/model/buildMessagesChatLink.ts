// src/features/messages/model/buildMessagesChatLink.ts
type BuildMessagesChatLinkParams = {
  specialistId: string;
  specialistSlug: string;
  specialistName: string;
  specialistAvatarUrl?: string;
};

export function buildMessagesChatLink(
  params: BuildMessagesChatLinkParams,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set('specialistId', params.specialistId.trim());
  searchParams.set('specialistSlug', params.specialistSlug.trim());
  searchParams.set('specialistName', params.specialistName.trim());

  if (params.specialistAvatarUrl?.trim()) {
    searchParams.set('specialistAvatarUrl', params.specialistAvatarUrl.trim());
  }

  return `/messages?${searchParams.toString()}`;
}