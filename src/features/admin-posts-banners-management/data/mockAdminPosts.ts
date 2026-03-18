// src/features/admin-posts-banners-management/data/mockAdminPosts.ts
import type { AdminManagedPost } from '../model/types';

export const INITIAL_ADMIN_MANAGED_POSTS: AdminManagedPost[] = [
  {
    id: 'admin-post-1',
    title: 'Как подготовить питомца к первой передержке',
    content:
      'Передержка может стать стрессом для животного, если его не подготовить заранее. Познакомьте питомца с ситтером до заселения, передайте привычные вещи, составьте понятный режим прогулок и кормления, а также заранее расскажите о реакциях питомца на чужих людей, шум и новую обстановку.',
    imageUrls: ['/images/post-1.png'],
    coverImageUrl: '/images/post-1.png',
    tags: ['уход', 'передержка'],
    status: 'published',
    publishedAt: '2026-02-20T10:00:00.000Z',
    createdAt: '2026-02-19T18:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'admin-post-2',
    title: '5 признаков хорошего петситтера',
    content:
      'Хороший петситтер задаёт уточняющие вопросы, внимательно относится к режиму питомца, умеет присылать понятные отчёты и знает базовые правила безопасности. Для владельца это означает предсказуемость, спокойствие и доверие к специалисту.',
    imageUrls: [],
    coverImageUrl: undefined,
    tags: ['советы'],
    status: 'published',
    publishedAt: '2026-02-18T14:30:00.000Z',
    createdAt: '2026-02-18T10:30:00.000Z',
    updatedAt: '2026-02-18T14:30:00.000Z',
  },
  {
    id: 'admin-post-3',
    title: 'Новый раздел с рекомендациями для владельцев',
    content:
      'Мы готовим отдельную подборку материалов для владельцев животных: инструкции, памятки, чек-листы и советы по взаимодействию со специалистами. Материал находится в черновике и будет опубликован после финальной редакторской проверки.',
    imageUrls: ['/images/post-3.png', '/images/post-3-extra.png'],
    coverImageUrl: '/images/post-3.png',
    tags: ['новости', 'платформа'],
    status: 'draft',
    createdAt: '2026-03-10T09:00:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
  },
];