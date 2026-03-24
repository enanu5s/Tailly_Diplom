// src/features/shop/model/shopCartStore.ts
import { makeAutoObservable } from 'mobx';

import { authStore } from '@/features/auth';
import type { AuthUser } from '@/features/auth/model/authStore';

import type { Product } from './types';

type StoredCartItem = {
  productId: string;
  quantity: number;
};

type CartStoragePayload = {
  items: StoredCartItem[];
};

type PendingCartMergePrompt = {
  userKey: string;
  guestItemsCount: number;
  guestLinesCount: number;
  userItemsCount: number;
  userLinesCount: number;
};

const STORAGE_KEY_PREFIX = 'tailly_shop_cart';
const GUEST_STORAGE_KEY = `${STORAGE_KEY_PREFIX}_guest`;

function isStoredCartItem(value: unknown): value is StoredCartItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<StoredCartItem>;

  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.quantity === 'number' &&
    Number.isFinite(candidate.quantity)
  );
}

function normalizeItems(items: StoredCartItem[]): StoredCartItem[] {
  const merged = new Map<string, number>();

  items.forEach((item) => {
    const normalizedQuantity = Math.max(0, Math.floor(item.quantity));

    if (!item.productId || normalizedQuantity <= 0) {
      return;
    }

    const current = merged.get(item.productId) ?? 0;
    merged.set(item.productId, current + normalizedQuantity);
  });

  return Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function parseStoredItems(raw: string | null): StoredCartItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return normalizeItems(parsed.filter(isStoredCartItem));
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'items' in parsed &&
      Array.isArray((parsed as CartStoragePayload).items)
    ) {
      return normalizeItems(
        (parsed as CartStoragePayload).items.filter(isStoredCartItem),
      );
    }

    return [];
  } catch {
    return [];
  }
}

function cloneItems(items: StoredCartItem[]): StoredCartItem[] {
  return JSON.parse(JSON.stringify(items)) as StoredCartItem[];
}

function getItemsCount(items: StoredCartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getUserStorageIdentity(user: AuthUser | null): string | null {
  if (!user) {
    return null;
  }

  if (typeof user.id === 'string') {
    return user.id;
  }

  if ('clientId' in user && typeof user.clientId === 'string') {
    return user.clientId;
  }

  if ('specialistId' in user && typeof user.specialistId === 'string') {
    return user.specialistId;
  }

  if ('adminId' in user && typeof user.adminId === 'string') {
    return user.adminId;
  }

  if (typeof user.email === 'string') {
    return user.email.toLowerCase();
  }

  return null;
}

function buildUserStorageKey(user: AuthUser | null): string {
  const identity = getUserStorageIdentity(user);

  if (!identity) {
    return GUEST_STORAGE_KEY;
  }

  return `${STORAGE_KEY_PREFIX}_user_${identity}`;
}

function debugCartStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[CART STORAGE]', {
    guest: window.localStorage.getItem(GUEST_STORAGE_KEY),
    allKeys: Object.keys(window.localStorage).filter((key) =>
      key.startsWith(STORAGE_KEY_PREFIX),
    ),
  });
}

export class ShopCartStore {
  items: StoredCartItem[] = [];

  pendingCartMergePrompt: PendingCartMergePrompt | null = null;

  private activeStorageKey = GUEST_STORAGE_KEY;

  private previousUserKey: string | null = null;

  private unsubscribeAuth: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.initializeFromAuthState();
    this.unsubscribeAuth = authStore.subscribe(this.handleAuthChanged);
  }

  private initializeFromAuthState(): void {
    const authState = authStore.getState();
    const user = authState.user;

    this.previousUserKey = getUserStorageIdentity(user);
    this.activeStorageKey = buildUserStorageKey(user);
    this.items = this.readItemsByStorageKey(this.activeStorageKey);
  }

  private handleAuthChanged(): void {
    console.log('[CART] auth changed', {
      prevUser: this.previousUserKey,
      nextUser: getUserStorageIdentity(authStore.getState().user),
      user: authStore.getState().user,
    });
    const authState = authStore.getState();
    const nextUser = authState.user;
    const nextUserKey = getUserStorageIdentity(nextUser);

    const didLogin = this.previousUserKey === null && nextUserKey !== null;
    const didLogout = this.previousUserKey !== null && nextUserKey === null;
    const didSwitchUser =
      this.previousUserKey !== null &&
      nextUserKey !== null &&
      this.previousUserKey !== nextUserKey;

    console.log('[CART] flags', {
      didLogin,
      didLogout,
      didSwitchUser,
    });
    if ((didLogin || didSwitchUser) && nextUser && nextUserKey) {
      this.handleLogin(nextUser, nextUserKey);
      this.previousUserKey = nextUserKey;
      return;
    }

    if (didLogout) {
      this.pendingCartMergePrompt = null;
      this.switchToGuestCart();
      this.previousUserKey = null;
      return;
    }

    this.previousUserKey = nextUserKey;
    this.activeStorageKey = buildUserStorageKey(nextUser);
    this.items = this.readItemsByStorageKey(this.activeStorageKey);
  }

  private handleLogin(user: AuthUser, userKey: string): void {
    console.log('[CART] handleLogin start');
    debugCartStorage();
    const guestItems = this.readItemsByStorageKey(GUEST_STORAGE_KEY);
    const userStorageKey = buildUserStorageKey(user);
    const userItems = this.readItemsByStorageKey(userStorageKey);

    console.log('[CART] carts before decision', {
      guestItems,
      userItems,
    });
    this.activeStorageKey = userStorageKey;
    this.items = userItems;

    if (guestItems.length > 0) {
      console.log('[CART] SHOW PROMPT');
      this.pendingCartMergePrompt = {
        userKey,
        guestItemsCount: getItemsCount(guestItems),
        guestLinesCount: guestItems.length,
        userItemsCount: getItemsCount(userItems),
        userLinesCount: userItems.length,
      };
      return;
    }

    this.pendingCartMergePrompt = null;
  }

  confirmPendingCartMerge(): void {
    const authState = authStore.getState();
    const user = authState.user;
    const userKey = getUserStorageIdentity(user);

    if (!user || !userKey || !this.pendingCartMergePrompt) {
      return;
    }

    const guestItems = this.readItemsByStorageKey(GUEST_STORAGE_KEY);
    const userStorageKey = buildUserStorageKey(user);
    const userItems = this.readItemsByStorageKey(userStorageKey);

    console.log('[CART] confirm merge', {
      guestItems,
      userItems,
      userStorageKey,
    });
    const mergedItems = normalizeItems([...userItems, ...guestItems]);

    this.activeStorageKey = userStorageKey;
    this.items = mergedItems;

    this.writeItemsByStorageKey(userStorageKey, mergedItems);
    this.clearStorageKey(GUEST_STORAGE_KEY);
    this.pendingCartMergePrompt = null;
  }

  discardGuestCartAfterLogin(): void {
    const authState = authStore.getState();
    const user = authState.user;
    const userKey = getUserStorageIdentity(user);

    if (!user || !userKey || !this.pendingCartMergePrompt) {
      return;
    }

    const userStorageKey = buildUserStorageKey(user);
    const userItems = this.readItemsByStorageKey(userStorageKey);

    this.activeStorageKey = userStorageKey;
    this.items = userItems;
    console.log('[CART] discard guest cart after login', {
      userStorageKey,
      userItems,
    });
    this.clearStorageKey(GUEST_STORAGE_KEY);
    this.pendingCartMergePrompt = null;
  }

  private switchToGuestCart(): void {
    this.activeStorageKey = GUEST_STORAGE_KEY;
    this.items = this.readItemsByStorageKey(GUEST_STORAGE_KEY);

    console.log('[CART] switched to guest cart', {
      activeStorageKey: this.activeStorageKey,
      items: this.items,
    });
    debugCartStorage();
  }

  private readItemsByStorageKey(storageKey: string): StoredCartItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    return parseStoredItems(window.localStorage.getItem(storageKey));
  }

  private writeItemsByStorageKey(storageKey: string, items: StoredCartItem[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        items: normalizeItems(items),
      } satisfies CartStoragePayload),
    );
  }

  private clearStorageKey(storageKey: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(storageKey);
  }

  private persist(): void {
    console.log('[CART] persist', {
      activeStorageKey: this.activeStorageKey,
      items: this.items,
    });

    this.writeItemsByStorageKey(this.activeStorageKey, this.items);
    debugCartStorage();
  }

  getQuantity(productId: string): number {
    const item = this.items.find((entry) => entry.productId === productId);
    return item?.quantity ?? 0;
  }

  add(productId: string, quantity = 1): void {
    console.log('[CART] add start', {
      productId,
      quantity,
      activeStorageKey: this.activeStorageKey,
      currentItems: this.items,
    });

    const normalizedQuantity = Math.floor(quantity);

    if (normalizedQuantity <= 0) {
      return;
    }

    const existing = this.items.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += normalizedQuantity;
    } else {
      this.items = [...this.items, { productId, quantity: normalizedQuantity }];
    }

    this.items = normalizeItems(this.items);
    console.log('[CART] add result before persist', {
      activeStorageKey: this.activeStorageKey,
      items: this.items,
    });
    this.persist();
  }

  setQuantity(productId: string, quantity: number): void {
    const normalizedQuantity = Math.floor(quantity);

    if (normalizedQuantity <= 0) {
      this.remove(productId);
      return;
    }

    const existing = this.items.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity = normalizedQuantity;
    } else {
      this.items = [...this.items, { productId, quantity: normalizedQuantity }];
    }

    this.items = normalizeItems(this.items);
    this.persist();
  }

  increment(productId: string): void {
    this.add(productId, 1);
  }

  decrement(productId: string): void {
    const currentQuantity = this.getQuantity(productId);

    if (currentQuantity <= 1) {
      this.remove(productId);
      return;
    }

    this.setQuantity(productId, currentQuantity - 1);
  }

  remove(productId: string): void {
    this.items = this.items.filter((item) => item.productId !== productId);
    this.persist();
  }

  clear(): void {
    this.items = [];
    this.persist();
  }

  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get activeCartScope(): 'guest' | 'user' {
    return this.activeStorageKey === GUEST_STORAGE_KEY ? 'guest' : 'user';
  }

  get snapshot(): StoredCartItem[] {
    return cloneItems(this.items);
  }

  get hasPendingCartMergePrompt(): boolean {
    return Boolean(this.pendingCartMergePrompt);
  }

  getTotalPrice(products: Product[]): number {
    return this.items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return sum;
      }

      return sum + product.price * item.quantity;
    }, 0);
  }

  destroy(): void {
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;
  }
}

export const shopCartStore = new ShopCartStore();
