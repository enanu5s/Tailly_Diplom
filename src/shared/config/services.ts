// src/shared/config/services.ts

export type ServiceId = 'walking' | 'boarding' | 'grooming' | 'training' | 'photoshoot';

export interface ServiceConfig {
  id: ServiceId;
  title: string;
  subtitle: string; // для Home
  iconUrl: string; // для Home
}

export const SERVICES: ServiceConfig[] = [
  {
    id: 'walking',
    title: 'Выгул',
    subtitle: 'Индивидуальный подход, активные прогулки и полная безопасность',
    iconUrl: '/images/home/s-walk.png',
  },
  {
    id: 'boarding',
    title: 'Передержка',
    subtitle: 'Круглосуточный присмотр, сбалансированное питание и любовь к вашему питомцу',
    iconUrl: '/images/home/s-boarding.png',
  },
  {
    id: 'grooming',
    title: 'Груминг',
    subtitle: 'Красивые стрижки, гигиена и спа-уход',
    iconUrl: '/images/home/s-grooming.png',
  },
  {
    id: 'training',
    title: 'Тренировки',
    subtitle: 'Коррекция поведения, освоение команд и социализация под руководством зоопсихолога',
    iconUrl: '/images/home/s-training.png',
  },
  {
    id: 'photoshoot',
    title: 'Фотосессия',
    subtitle: 'Сохраним самые трогательные моменты в идеальном качестве',
    iconUrl: '/images/home/s-photoshoot.png',
  },
];
