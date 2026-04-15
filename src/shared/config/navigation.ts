// src/shared/config/navigation.ts

import { SERVICES } from './services';

export interface NavItem {
  label: string;
  to: string;
  children?: NavItem[];
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
    { label: 'Пользовательское соглашение', to: '/user-agreement' },
    { label: 'Публичная оферта', to: '/public-offer' },
    { label: 'Политика конфиденциальности', to: '/privacy-policy' },
    { label: 'Условия возврата', to: '/refund-policy' },
    { label: 'Агентский договор', to: '/agency-contract' },
  ],
  contacts: {
    email: 'support@tailly.ru',
    phone: '+7 (495) 123-45-67',
    address: 'г. Москва, ул. Примерная, д. 10',
    telegramUrl: 'https://t.me/tailly',
    vkUrl: 'https://vk.com/tailly',
  },
};