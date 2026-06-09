import {
  canRepeatProductOrder,
  getCartItemMergeKey,
  mapOrderItemsToCartItems,
} from '../model/productOrderRepeat';

import type {
  PersistedCartItem,
  RepeatableProductOrder,
} from '../model/productOrderRepeat';

const SHOP_CART_STORAGE_KEY = 'tailly_shop_cart';

function readCartFromStorage(): PersistedCartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isPersistedCartItem);
  } catch (error) {
    console.error('[productOrderRepeatService.readCartFromStorage] parse error', {
      error,
    });
    return [];
  }
}

function writeCartToStorage(items: PersistedCartItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SHOP_CART_STORAGE_KEY,
    JSON.stringify(JSON.parse(JSON.stringify(items))),
  );

  console.log('[productOrderRepeatService.writeCartToStorage] saved', {
    storageKey: SHOP_CART_STORAGE_KEY,
    items,
  });

  window.dispatchEvent(new CustomEvent('tailly:cart-updated'));

  console.log('[productOrderRepeatService.writeCartToStorage] event dispatched', {
    eventName: 'tailly:cart-updated',
  });
}

function isPersistedCartItem(value: unknown): value is PersistedCartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<PersistedCartItem>;

  return (
    typeof item.productId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price)
  );
}

function mergeCartItems(
  currentItems: PersistedCartItem[],
  incomingItems: PersistedCartItem[],
): PersistedCartItem[] {
  const mergedMap = new Map<string, PersistedCartItem>();

  currentItems.forEach((item) => {
    mergedMap.set(getCartItemMergeKey(item), { ...item });
  });

  incomingItems.forEach((item) => {
    const key = getCartItemMergeKey(item);
    const existingItem = mergedMap.get(key);

    if (!existingItem) {
      mergedMap.set(key, { ...item });
      return;
    }

    mergedMap.set(key, {
      ...existingItem,
      quantity: existingItem.quantity + item.quantity,
    });
  });

  return Array.from(mergedMap.values());
}

class ProductOrderRepeatService {
  repeat(order: RepeatableProductOrder): void {
    console.log('[productOrderRepeatService.repeat] start', { order });

    if (!canRepeatProductOrder(order)) {
      console.error('[productOrderRepeatService.repeat] cannot repeat', { order });
      throw new Error('Этот заказ нельзя повторить.');
    }

    const currentCartItems = readCartFromStorage();
    const incomingItems = mapOrderItemsToCartItems(order);

    console.log('[productOrderRepeatService.repeat] before merge', {
      currentCartItems,
      incomingItems,
    });

    if (incomingItems.length === 0) {
      console.error('[productOrderRepeatService.repeat] no incoming items', {
        order,
      });
      throw new Error('В заказе нет товаров для повторного оформления.');
    }

    const mergedItems = mergeCartItems(currentCartItems, incomingItems);

    console.log('[productOrderRepeatService.repeat] merged', {
      mergedItems,
    });

    writeCartToStorage(mergedItems);
  }
}

export const productOrderRepeatService = new ProductOrderRepeatService();
