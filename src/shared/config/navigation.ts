// src/shared/config/navigation.ts
export interface NavItem {
  label: string;
  to: string;
  children?: NavItem[]; // для подменю
}

export const mainNav: NavItem[] = [
  {
    label: 'Услуги',
    to: '/services',
    children: [
      { label: 'Груминг', to: '/services/grooming' },
      { label: 'Выгул', to: '/services/walking' },
      { label: 'Передержка', to: '/services/boarding' },
      // добавляйте новые услуги сюда — они автоматически появятся в дропдауне
    ],
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