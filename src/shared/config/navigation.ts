// src/shared/config/navigation.ts

import { SERVICES } from './services';

export interface NavItem {
  label: string;
  to: string;
  children?: NavItem[]; // для подменю
}

export const mainNav: NavItem[] = [
  {
    label: 'Услуги',
    to: '/services',
    children: SERVICES.map((s) => ({
      label: s.title,
      to: `/services?service=${s.id}`,
    })),
  },

  { label: 'Стать специалистом', to: '/become-specialist' },
  { label: 'Магазин', to: '/shop' },
  { label: 'О нас', to: '/about' },
  { label: 'Сообщения', to: '/messages' },
  { label: 'Войти', to: '/login' },
];

export const footerLinks = {
  menu: [
    { label: 'Главная', to: '/' },
    { label: 'Услуги', to: '/services' },
    { label: 'Стать специалистом', to: '/become-specialist' },
    { label: 'Магазин', to: '/shop' },
    { label: 'О нас', to: '/about' },
    { label: 'Сообщения', to: '/messages' },
  ],
  documents: [
    { label: 'Политика конфиденциальности', to: '/privacy-policy' },
    { label: 'Пользовательское соглашение', to: '/user-agreement' },
    { label: 'Публичная оферта', to: '/public-offer' },
  ],
  contacts: {
    email: 'support@tailly.ru',
    phone: '+7 (495) 123-45-67',
    address: 'г. Москва, ул. Примерная, д. 10',
  },
};