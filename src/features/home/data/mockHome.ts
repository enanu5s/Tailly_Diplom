// src/features/home/data/mockHome.ts

import { getDemoSpecialistDisplayNameForProfileId } from '@/shared/mock-db/seed/demoDataset.seed';

import type { HomeReview } from '../model/types';

type HomeReviewSeed = Omit<HomeReview, 'sitterName'>;

const MOCK_REVIEWS_SEED: HomeReviewSeed[] = [
  {
    id: 'rv-1',
    createdAtIso: '2026-03-20T12:00:00.000Z',
    rating: 5,
    text:
      'Очень внимательный специалист: договорились о времени, получили фотоотчёт и короткие голосовые. Ричи вернулся спокойным и довольным, без стресса после прогулки. Рекомендуем и сами обратимся снова, когда понадобится выгул в будни.',
    petName: 'Ричи',
    ownerName: 'Иван Петров',
    sitterId: 'specialist-1',
    serviceTitle: 'Выгул',
    photoUrls: ['/images/reviews/r-1.png', '/images/reviews/r-2.png'],
  },
  {
    id: 'rv-2',
    createdAtIso: '2026-02-21T12:00:00.000Z',
    rating: 5,
    text:
      'Передержка прошла идеально: каждый день присылали фото и коротко отвечали на сообщения. Питомец чувствовал себя как дома, а мы не переживали в отъезде. Спасибо за ответственность и тёплое отношение к Мие.',
    petName: 'Мия',
    ownerName: 'Мария К.',
    sitterId: 'specialist-2',
    serviceTitle: 'Передержка',
    photoUrls: [],
  },
  {
    id: 'rv-3',
    createdAtIso: '2026-03-18T10:00:00.000Z',
    rating: 5,
    text:
      'Заказывали груминг впервые: объяснили, как подготовить собаку, на месте всё показали и согласовали длину шерсти. Результат аккуратный, без спешки, питомец вёл себя спокойно. Отдельное спасибо за советы по уходу между визитами в салон.',
    petName: 'Барсик',
    ownerName: 'Елена Смирнова',
    sitterId: 'specialist-3',
    serviceTitle: 'Груминг',
    photoUrls: ['/images/reviews/r-3.png'],
  },
  {
    id: 'rv-4',
    createdAtIso: '2026-03-15T14:30:00.000Z',
    rating: 4,
    text:
      'Визит прошёл хорошо, но хотелось бы чуть больше обратной связи по завершении. В целом специалист пунктуальный и вежливый, питомец относился без страха.',
    petName: 'Том',
    ownerName: 'Антон В.',
    sitterId: 'specialist-1',
    serviceTitle: 'Выгул',
    photoUrls: ['/images/reviews/r-4.png'],
  },
  {
    id: 'rv-5',
    createdAtIso: '2026-03-10T09:00:00.000Z',
    rating: 5,
    text:
      'Оставляли кота на передержку на неделю: специалист прислал фото корма, лотка и игр, отвечал быстро. Ключи и инструкции соблюдены, вернулись — всё чисто и спокойно. Такой уровень сервиса редко встречается, будем рекомендовать друзьям.',
    petName: 'Снежок',
    ownerName: 'Дмитрий Н.',
    sitterId: 'specialist-4',
    serviceTitle: 'Передержка',
    photoUrls: ['/images/reviews/r-5.png', '/images/reviews/r-5b.png'],
  },
  {
    id: 'rv-6',
    createdAtIso: '2026-03-08T16:00:00.000Z',
    rating: 5,
    text: 'Всё супер.',
    petName: 'Жучка',
    ownerName: 'Павел',
    sitterId: 'specialist-2',
    serviceTitle: 'Тренировки',
    photoUrls: ['/images/reviews/r-6.png'],
  },
  {
    id: 'rv-7',
    createdAtIso: '2026-03-05T11:00:00.000Z',
    rating: 5,
    text:
      'Заказывали Фотосессию: заранее согласовали локацию и время, на съёмке спокойно работали с собакой. Снимки прислали в срок, свет и кадры удачные. Площадка удобная, оплата прозрачная.',
    petName: 'Рекс',
    ownerName: 'Светлана П.',
    sitterId: 'specialist-5',
    serviceTitle: 'Фотосессия',
    photoUrls: ['/images/reviews/r-7.png'],
  },
];

export const MOCK_REVIEWS: HomeReview[] = MOCK_REVIEWS_SEED.map((r) => ({
  ...r,
  sitterName: getDemoSpecialistDisplayNameForProfileId(r.sitterId),
}));

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
