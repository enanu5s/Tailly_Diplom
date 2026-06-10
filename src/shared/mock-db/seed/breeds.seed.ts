// src/shared/mock-db/seed/breeds.seed.ts

import type { Breed } from '@/features/pets/model/types';

export const SEED_BREEDS: Breed[] = [
  { id: 'b-dog-1', type: 'dog', title: 'Вельш-корги пемброк' },
  { id: 'b-dog-2', type: 'dog', title: 'Лабрадор-ретривер' },
  { id: 'b-dog-3', type: 'dog', title: 'Джек-рассел-терьер' },
  { id: 'b-dog-4', type: 'dog', title: 'Йоркширский терьер' },
  { id: 'b-dog-5', type: 'dog', title: 'Бордер-колли' },
  { id: 'b-cat-1', type: 'cat', title: 'Британская короткошёрстная' },
  { id: 'b-cat-2', type: 'cat', title: 'Сфинкс' },
  { id: 'b-cat-3', type: 'cat', title: 'Мейн-кун' },
  { id: 'b-cat-4', type: 'cat', title: 'Сибирская' },
  { id: 'b-bird-1', type: 'bird', title: 'Волнистый попугай' },
  { id: 'b-bird-2', type: 'bird', title: 'Корелла' },
  { id: 'b-bird-3', type: 'bird', title: 'Канарейка' },
  { id: 'b-bird-4', type: 'bird', title: 'Неразлучник' },
  { id: 'b-rodent-1', type: 'rodent', title: 'Хомяк джунгарский' },
  { id: 'b-rodent-2', type: 'rodent', title: 'Морская свинка' },
  { id: 'b-rodent-3', type: 'rodent', title: 'Шиншилла' },
  { id: 'b-rodent-4', type: 'rodent', title: 'Дегу' },
  { id: 'b-rabbit-1', type: 'rabbit', title: 'Декоративный кролик (карликовый)' },
  { id: 'b-rabbit-2', type: 'rabbit', title: 'Рекс' },
  { id: 'b-rabbit-3', type: 'rabbit', title: 'Бабочка' },
  { id: 'b-reptile-1', type: 'reptile', title: 'Леопардовый геккон' },
  { id: 'b-reptile-2', type: 'reptile', title: 'Красноухая черепаха' },
  { id: 'b-reptile-3', type: 'reptile', title: 'Королевский питон' },
  { id: 'b-fish-1', type: 'fish', title: 'Золотая рыбка' },
  { id: 'b-fish-2', type: 'fish', title: 'Скаляр' },
  { id: 'b-fish-3', type: 'fish', title: 'Неон' },
  { id: 'b-amphibian-1', type: 'amphibian', title: 'Аксолотль' },
  { id: 'b-amphibian-2', type: 'amphibian', title: 'Аксолотль (золотистый)' },
];
