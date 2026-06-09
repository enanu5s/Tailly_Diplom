// src/features/messages/service/messagesService.ts
import { messagesApi } from '../api/messagesApi';

import type {
  DraftMessageImageAttachment,
  EnsureClientThreadPayload,
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MarkMessagesAsReadPayload,
  MessageImageAttachment,
  MessagesSnapshot,
  MessagesUnreadSummary,
  MessagesViewer,
  SendMessagePayload,
} from '../model/types';

const MAX_ATTACHMENTS_PER_MESSAGE = 10;
const MAX_SOURCE_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
const MAX_COMPRESSED_DATA_URL_LENGTH = 900_000;
const RESIZE_DIMENSION_STEPS = [1600, 1280, 1024, 900] as const;
const QUALITY_STEPS = [0.82, 0.72, 0.64, 0.56, 0.5] as const;

function createAttachmentId(): string {
  return `draft_image_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function loadImageFromObjectUrl(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось обработать изображение.'));
    image.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      if (!result) {
        reject(new Error('Не удалось прочитать изображение.'));
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать изображение.'));
    };

    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Не удалось подготовить изображение.'));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function getResizedDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
): { width: number; height: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return {
      width: maxDimension,
      height: maxDimension,
    };
  }

  const longestSide = Math.max(sourceWidth, sourceHeight);
  const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

async function compressImageFile(file: File): Promise<{
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes: number;
}> {
  if (file.type === 'image/gif') {
    throw new Error(
      'GIF пока не поддерживается в mock-хранилище сообщений. Используй JPG, PNG или WEBP.',
    );
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromObjectUrl(objectUrl);

    for (const maxDimension of RESIZE_DIMENSION_STEPS) {
      const { width, height } = getResizedDimensions(
        image.naturalWidth,
        image.naturalHeight,
        maxDimension,
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Не удалось обработать изображение.');
      }

      context.drawImage(image, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, 'image/webp', quality);
        const url = await blobToDataUrl(blob);

        if (url.length <= MAX_COMPRESSED_DATA_URL_LENGTH) {
          return {
            url,
            mimeType: 'image/webp',
            width,
            height,
            sizeBytes: blob.size,
          };
        }
      }
    }

    throw new Error(
      'Фото слишком большое даже после сжатия. Попробуй выбрать изображение меньшего размера.',
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error(`Файл «${file.name}» не является изображением.`);
  }

  if (file.size <= 0) {
    throw new Error(`Файл «${file.name}» пустой.`);
  }

  if (file.size > MAX_SOURCE_IMAGE_SIZE_BYTES) {
    throw new Error(`Файл «${file.name}» превышает 12 МБ.`);
  }
}

class MessagesService {
  getSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
    return messagesApi.getSnapshot(viewer);
  }

  getUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
    return messagesApi.getUnreadSummary(viewer);
  }

  ensureSupportThread(payload: EnsureSupportThreadPayload): Promise<MessagesSnapshot> {
    return messagesApi.ensureSupportThread(payload);
  }

  ensureSpecialistThread(
    payload: EnsureSpecialistThreadPayload,
  ): Promise<MessagesSnapshot> {
    return messagesApi.ensureSpecialistThread(payload);
  }

  ensureClientThread(payload: EnsureClientThreadPayload): Promise<MessagesSnapshot> {
    return messagesApi.ensureClientThread(payload);
  }

  markMessagesAsRead(payload: MarkMessagesAsReadPayload): Promise<MessagesSnapshot> {
    return messagesApi.markMessagesAsRead(payload);
  }

  sendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
    return messagesApi.sendMessage(payload);
  }

  async prepareDraftImageAttachments(
    files: File[],
    existingCount: number,
  ): Promise<DraftMessageImageAttachment[]> {
    const normalizedFiles = files.filter((file) => file instanceof File);

    if (normalizedFiles.length === 0) {
      return [];
    }

    if (existingCount + normalizedFiles.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new Error(
        `Можно прикрепить не более ${MAX_ATTACHMENTS_PER_MESSAGE} фото к одному сообщению.`,
      );
    }

    const attachments: DraftMessageImageAttachment[] = [];

    for (const file of normalizedFiles) {
      validateImageFile(file);

      const compressed = await compressImageFile(file);

      attachments.push({
        id: createAttachmentId(),
        kind: 'image',
        name: file.name.trim() || 'image',
        mimeType: compressed.mimeType,
        url: compressed.url,
        thumbnailUrl: compressed.url,
        width: compressed.width,
        height: compressed.height,
        sizeBytes: compressed.sizeBytes,
        file,
      });
    }

    return attachments;
  }

  stripDraftAttachmentFiles(
    attachments: DraftMessageImageAttachment[],
  ): MessageImageAttachment[] {
    return attachments.map(({ file: _file, ...attachment }) => attachment);
  }
}

export const messagesService = new MessagesService();
