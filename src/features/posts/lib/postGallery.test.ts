import { describe, expect, it } from 'vitest';

import type { Post } from '../model/types';

import { getPostGalleryUrls } from './postGallery';

const basePost = (): Post => ({
  id: '1',
  title: 't',
  content: 'c',
  publishedAt: '2026-01-01',
});

describe('getPostGalleryUrls', () => {
  it('возвращает непустые строки из imageUrls (без trim значений)', () => {
    const post = {
      ...basePost(),
      imageUrls: [' https://a ', '', 'https://b', '   '],
    };
    expect(getPostGalleryUrls(post)).toEqual([' https://a ', 'https://b']);
  });

  it('при пустом imageUrls использует imageUrl', () => {
    const post = { ...basePost(), imageUrls: [], imageUrl: 'https://cover' };
    expect(getPostGalleryUrls(post)).toEqual(['https://cover']);
  });

  it('без картинок возвращает пустой массив', () => {
    expect(getPostGalleryUrls(basePost())).toEqual([]);
    expect(getPostGalleryUrls({ ...basePost(), imageUrl: '  ' })).toEqual([]);
  });
});
