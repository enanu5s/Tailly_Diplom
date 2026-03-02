// src/shared/config/services.ts

export type ServiceId =
  | 'walking'
  | 'boarding'
  | 'grooming'
  | 'training'
  | 'photoshoot';

export interface ServiceConfig {
  id: ServiceId;
  title: string;
  subtitle: string;     // для Home
  iconUrl: string;      // для Home
}

export const SERVICES: ServiceConfig[] = [
  {
    id: 'walking',
    title: 'Выгул',
    subtitle: 'Пешие прогулки и активность',
    iconUrl: '/images/home/s-walk.png',
  },
  {
    id: 'boarding',
    title: 'Передержка',
    subtitle: 'Забота на время отъезда',
    iconUrl: '/images/home/s-boarding.png',
  },
  {
    id: 'grooming',
    title: 'Груминг',
    subtitle: 'Стрижка, мытьё, уход',
    iconUrl: '/images/home/s-grooming.png',
  },
  {
    id: 'training',
    title: 'Тренировки',
    subtitle: 'Базовые команды и привычки',
    iconUrl: '/images/home/s-training.png',
  },
  {
    id: 'photoshoot',
    title: 'Фотосессия',
    subtitle: 'Памятные кадры с питомцем',
    iconUrl: '/images/home/s-photoshoot.png',
  },
];