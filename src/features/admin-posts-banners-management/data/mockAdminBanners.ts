// src/features/admin-posts-banners-management/data/mockAdminBanners.ts
import type { AdminManagedBanner } from '../model/types';

export const INITIAL_ADMIN_MANAGED_BANNERS: AdminManagedBanner[] = [
  {
    id: 'banner-1',
    title: 'Найдите проверенного петситтера рядом',
    description:
      'Главный баннер на главной странице с переходом в поиск специалистов.',
    imageUrl: '/images/banner-home-hero.png',
    linkUrl: '/specialists',
    linkTarget: 'specialists',
    placement: 'home_hero',
    status: 'published',
    startsAt: '2026-03-01T00:00:00.000Z',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'banner-2',
    title: 'Полезные статьи по уходу за питомцами',
    description:
      'Баннер внутри раздела постов для повышения просмотров публикаций.',
    imageUrl: '/images/banner-posts.png',
    linkUrl: '/posts/admin-post-1',
    linkTarget: 'posts',
    linkedPostId: 'admin-post-1',
    placement: 'posts',
    status: 'published',
    startsAt: '2026-03-05T00:00:00.000Z',
    createdAt: '2026-03-04T12:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'banner-3',
    title: 'Весенний спецпроект',
    description:
      'Черновой баннер для будущей кампании в каталоге специалистов.',
    imageUrl: '/images/banner-specialists.png',
    linkUrl: '/specialists',
    linkTarget: 'specialists',
    placement: 'specialists',
    status: 'draft',
    createdAt: '2026-03-12T13:20:00.000Z',
    updatedAt: '2026-03-12T13:20:00.000Z',
  },
];