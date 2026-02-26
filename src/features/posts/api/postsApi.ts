//src/features/posts/api/postsApi.ts
import type { Post, PostsListParams, PostsListResponse } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * ВАЖНО:
 * - Если у вас уже есть общий request(...) в shared — подключи его вместо fetchJson
 * - Здесь сделано максимально “самодостаточно”, но не ломает архитектуру.
 */
async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text ||  `Request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

/* ---------------- MOCK DATA ---------------- */

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Как подготовить питомца к первой передержке',
    content:
      'Передержка — это стресс для животного, если подготовка отсутствует. Начните со знакомства с ситтером заранее, оставьте привычные игрушки и корм, составьте расписание прогулок и кормления. Важно заранее обсудить характер питомца и его реакции на шум/чужих людей...',
    publishedAt: '2026-02-20T10:00:00.000Z',
    imageUrl: '/images/post-1.png',
    tags: ['уход', 'передержка'],
  },
  {
    id: '2',
    title: '5 признаков хорошего петситтера',
    content:
      'Хороший петситтер всегда задаёт уточняющие вопросы, аккуратно относится к режиму питомца, готов присылать фото- и видеоотчёты, знает базовые правила безопасности на прогулке и умеет действовать при нестандартных ситуациях...',
    publishedAt: '2026-02-18T14:30:00.000Z',
    tags: ['советы'],
  },
  {
    id: '3',
    title: 'Что взять с собой, если питомец едет к ситтеру',
    content:
      'Список вещей обычно зависит от длительности передержки, но есть база: корм, миски, любимая подстилка, поводок/шлейка, аптечка, документы/ветпаспорт, и небольшой “пакет привычек” — игрушки и лакомства...',
    publishedAt: '2026-02-14T09:00:00.000Z',
    imageUrl: '/images/post-3.png',
  },
  {
    id: '4',
    title: 'Регулярные отчёты: почему это важно',
    content:
      'Отчёты снимают тревожность владельца и помогают быстрее заметить изменения в поведении животного. Фото и видео — не “формальность”, а часть заботы: вы понимаете, как питомец ест, гуляет, спит, реагирует на окружение...',
    publishedAt: '2026-02-10T12:00:00.000Z',
  },
  {
    id: '5',
    title: 'Как мы отбираем специалистов в Пет.Сит',
    content:
      'Мы проверяем опыт, мотивацию, проводим собеседование и оцениваем умение находить контакт с животными. Для нас важно не только “любить животных”, но и понимать особенности ухода за разными породами и возрастами...',
    publishedAt: '2026-02-05T08:15:00.000Z',
    imageUrl: '/images/post-5.png',
  },
  {
    id: '6',
    title: 'Уход за пожилыми питомцами: базовые принципы',
    content:
      'Пожилым животным важны мягкие нагрузки, стабильный режим, комфортная температура, более внимательный контроль питания и воды. Часто требуется контроль медикаментов и регулярная коммуникация с владельцем...',
    publishedAt: '2026-01-28T16:00:00.000Z',
  },
];

function sortPosts(posts: Post[], sort: PostsListParams['sort']): Post[] {
  const copy = [...posts];
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt));
    case 'title_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    case 'title_desc':
      return copy.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    case 'newest':
    default:
      return copy.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }
}

function filterSearch(posts: Post[], search?: string): Post[] {
  const q = (search ?? '').trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((p) => (p.title + ' ' + p.content).toLowerCase().includes(q));
}
async function mockGetLatestPosts(limit: number): Promise<Post[]> {
  const sorted = sortPosts(MOCK_POSTS, 'newest');
  return sorted.slice(0, limit);
}

async function mockGetPostsList(params: PostsListParams): Promise<PostsListResponse> {
  const sorted = sortPosts(MOCK_POSTS, params.sort ?? 'newest');
  const filtered = filterSearch(sorted, params.search);
  const total = filtered.length;

  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

async function mockGetPostById(id: string): Promise<Post> {
  const found = MOCK_POSTS.find((p) => p.id === id);
  if (!found) throw new Error('Пост не найден');
  return found;
}

/* ---------------- REAL REQUESTS ---------------- */

async function realGetLatestPosts(limit: number): Promise<Post[]> {
  // пример: GET /posts/latest?limit=5
  const url = new URL(`${API_BASE_URL}/posts/latest`);
  url.searchParams.set('limit', String(limit));
  return fetchJson<Post[]>(url);
}

async function realGetPostsList(params: PostsListParams): Promise<PostsListResponse> {
  // пример: GET /posts?page=1&pageSize=10&sort=newest&search=...
  const url = new URL(`${API_BASE_URL}/posts`);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('pageSize', String(params.pageSize));
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.search) url.searchParams.set('search', params.search);
  return fetchJson<PostsListResponse>(url);
}

async function realGetPostById(id: string): Promise<Post> {
  // пример: GET /posts/:id
  return fetchJson<Post>(`${API_BASE_URL}/posts/${encodeURIComponent(id)}`);
}

/* ---------------- PUBLIC API ---------------- */

export const postsApi = {
  getLatestPosts: (limit: number) => (USE_MOCK ? mockGetLatestPosts(limit) : realGetLatestPosts(limit)),
  getPostsList: (params: PostsListParams) => (USE_MOCK ? mockGetPostsList(params) : realGetPostsList(params)),
  getPostById: (id: string) => (USE_MOCK ? mockGetPostById(id) : realGetPostById(id)),
};