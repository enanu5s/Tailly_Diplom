// src/features/shop/service/shopOrdersFilters.ts

export type ShopOrdersFilterValue = 'all' | 'active' | 'completed' | 'cancelled';

export type ShopOrderStatusTone = 'active' | 'completed' | 'cancelled' | 'neutral';

export function mapShopOrderStatusLabel(status: string): string {
  switch (status) {
    case 'created':
      return 'Создан';
    case 'paid':
      return 'Оплачен';
    case 'processing':
      return 'В обработке';
    case 'delivering':
      return 'В пути';
    case 'ready-for-pickup':
      return 'Готов к выдаче';
    case 'completed':
      return 'Завершён';
    case 'cancelled':
      return 'Отменён';
    default:
      return 'Статус уточняется';
  }
}

/** Подписи статуса в списке заказов (в т.ч. под макет карточки «Заказы из магазина»). */
export function mapShopOrderStatusCardLabel(status: string): string {
  switch (status) {
    case 'delivering':
      return 'Передан курьеру';
    case 'completed':
      return 'Получен';
    default:
      return mapShopOrderStatusLabel(status);
  }
}

export function getShopOrderStatusTone(status: string): ShopOrderStatusTone {
  switch (status) {
    case 'created':
    case 'paid':
    case 'processing':
    case 'delivering':
    case 'ready-for-pickup':
      return 'active';

    case 'completed':
      return 'completed';

    case 'cancelled':
      return 'cancelled';

    default:
      return 'neutral';
  }
}

export function matchesShopOrdersFilter(
  status: string,
  filter: ShopOrdersFilterValue,
): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'completed') {
    return status === 'completed';
  }

  if (filter === 'cancelled') {
    return status === 'cancelled';
  }

  return (
    status === 'created' ||
    status === 'paid' ||
    status === 'processing' ||
    status === 'delivering' ||
    status === 'ready-for-pickup'
  );
}
