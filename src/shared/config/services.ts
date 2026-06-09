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
    subtitle: 'Индивидуальный подход, активные прогулки и\u00A0полная безопасность',
    iconUrl: '/images/home/s-walk.png',
  },
  {
    id: 'boarding',
    title: 'Передержка',
    subtitle: 'Круглосуточный присмотр, сбалансированное питание, любовь к\u00A0вашему питомцу',
    iconUrl: '/images/home/s-boarding.png',
  },
  {
    id: 'grooming',
    title: 'Груминг',
    subtitle: 'Красивые стрижки, гигиена и\u00A0спа-уход',
    iconUrl: '/images/home/s-grooming.png',
  },
  {
    id: 'training',
    title: 'Тренировки',
    subtitle: 'Коррекция поведения, освоение различных команд, социализация',
    iconUrl: '/images/home/s-training.png',
  },
  {
    id: 'photoshoot',
    title: 'Фотосессия',
    subtitle: 'Сохраним самые трогательные моменты в\u00A0идеальном качестве',
    iconUrl: '/images/home/s-photoshoot.png',
  },
];