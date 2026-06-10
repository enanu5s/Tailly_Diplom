// src/features/shop/model/shopFavoritesStore.ts

import { makeAutoObservable } from 'mobx';

import { authStore } from '@/features/auth/model/authStore';
import { isMockApiMode } from '@/shared/config/env';
import {
  readFavoriteProductIds,
  resolveCartFavoritesKey,
  writeFavoriteProductIds,
} from '@/shared/mock-db/accessors/cartFavorites';
import { hasUsableAccessToken } from '@/shared/lib/auth/hasUsableAccessToken';
import { canOrderShopProducts } from '@/shared/lib/auth/roleAccess';

import { shopFavoritesApi } from '../api/shopFavoritesApi';

const STORAGE_KEY = 'tailly_shop_favorites';
const SERVER_SYNC_DEBOUNCE_MS = 450;

export class ShopFavoritesStore {
  productIds: string[] = [];
  private syncTimerId: number | null = null;
  private isSyncInFlight = false;
  private hasPendingSync = false;
  private lastSyncedSnapshot = '';
  private unsubscribeAuth: (() => void) | null = null;
  private isHydratingFromServer = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.restore();
    this.unsubscribeAuth = authStore.subscribe(this.handleAuthChanged);

    if (this.canSyncWithServer()) {
      void this.hydrateFromServer();
    }
  }

  private favoritesDbKey(): string {
    const user = authStore.getState().user;
    return resolveCartFavoritesKey(user?.id ?? null);
  }

  private persist(): void {
    if (isMockApiMode) {
      writeFavoriteProductIds(this.favoritesDbKey(), this.productIds);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productIds));
    }

    this.scheduleServerSync();
  }

  private restore(): void {
    if (isMockApiMode) {
      this.productIds = readFavoriteProductIds(this.favoritesDbKey());
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        this.productIds = parsed;
      }
    } catch {
      this.productIds = [];
    }
  }

  has(productId: string): boolean {
    return this.productIds.includes(productId);
  }

  toggle(productId: string): void {
    if (this.has(productId)) {
      this.productIds = this.productIds.filter((id) => id !== productId);
    } else {
      this.productIds = [productId, ...this.productIds];
    }

    this.persist();
  }

  remove(productId: string): void {
    this.productIds = this.productIds.filter((id) => id !== productId);
    this.persist();
  }

  clear(): void {
    this.productIds = [];
    this.persist();
  }

  private handleAuthChanged(): void {
    if (this.canSyncWithServer()) {
      void this.hydrateFromServer();
      return;
    }

    this.scheduleServerSync();
  }

  private canSyncWithServer(): boolean {
    if (isMockApiMode) {
      return false;
    }

    return (
      hasUsableAccessToken(authStore.getToken()) &&
      canOrderShopProducts(authStore.getState().user)
    );
  }

  private buildSnapshotSignature(productIds: string[]): string {
    return JSON.stringify([...productIds].sort((left, right) => left.localeCompare(right)));
  }

  private scheduleServerSync(): void {
    if (this.isHydratingFromServer) {
      return;
    }

    if (!this.canSyncWithServer()) {
      return;
    }

    this.hasPendingSync = true;

    if (this.syncTimerId !== null) {
      window.clearTimeout(this.syncTimerId);
    }

    this.syncTimerId = window.setTimeout(() => {
      this.syncTimerId = null;
      void this.flushServerSync();
    }, SERVER_SYNC_DEBOUNCE_MS);
  }

  private async flushServerSync(): Promise<void> {
    if (!this.canSyncWithServer()) {
      this.hasPendingSync = false;
      return;
    }

    const snapshot = [...this.productIds];
    const signature = this.buildSnapshotSignature(snapshot);

    if (signature === this.lastSyncedSnapshot) {
      this.hasPendingSync = false;
      return;
    }

    if (this.isSyncInFlight) {
      this.hasPendingSync = true;
      return;
    }

    this.isSyncInFlight = true;
    this.hasPendingSync = false;

    try {
      await shopFavoritesApi.syncSnapshot(snapshot);
      this.lastSyncedSnapshot = signature;
    } catch (error) {
      console.warn('[favorites] server sync failed', { error });
      this.hasPendingSync = false;
    } finally {
      this.isSyncInFlight = false;

      if (this.hasPendingSync) {
        this.scheduleServerSync();
      }
    }
  }

  async ensureServerSynced(): Promise<void> {
    if (!this.canSyncWithServer()) {
      return;
    }

    if (this.syncTimerId !== null) {
      window.clearTimeout(this.syncTimerId);
      this.syncTimerId = null;
    }

    this.hasPendingSync = true;
    await this.flushServerSync();

    if (this.hasPendingSync) {
      await this.flushServerSync();
    }
  }

  private async hydrateFromServer(): Promise<void> {
    if (!this.canSyncWithServer()) {
      return;
    }

    this.isHydratingFromServer = true;

    try {
      const serverProductIds = await shopFavoritesApi.getFavorites();
      this.productIds = serverProductIds;

      if (isMockApiMode) {
        writeFavoriteProductIds(this.favoritesDbKey(), this.productIds);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productIds));
      }

      this.lastSyncedSnapshot = this.buildSnapshotSignature(serverProductIds);
    } catch (error) {
      console.warn('[favorites] hydrate from server failed', { error });
    } finally {
      this.isHydratingFromServer = false;
    }
  }

  destroy(): void {
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;

    if (this.syncTimerId !== null) {
      window.clearTimeout(this.syncTimerId);
      this.syncTimerId = null;
    }
  }

  get total(): number {
    return this.productIds.length;
  }
}

export const shopFavoritesStore = new ShopFavoritesStore();
