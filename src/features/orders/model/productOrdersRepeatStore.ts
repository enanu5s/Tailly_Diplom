//src/features/orders/model/productOrdersRepeatStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { productOrderRepeatService } from '../service/productOrderRepeatService';

import type { NavigateFunction } from 'react-router-dom';
import type { RepeatableProductOrder } from './productOrderRepeat';

class ProductOrdersRepeatStore {
  private loadingOrderIds = new Set<string>();

  private errorByOrderId = new Map<string, string>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  isRepeating(orderId: string): boolean {
    return this.loadingOrderIds.has(orderId);
  }

  getError(orderId: string): string | null {
    return this.errorByOrderId.get(orderId) ?? null;
  }

  clearError(orderId: string): void {
    this.errorByOrderId.delete(orderId);
  }

  async repeatOrder(
    order: RepeatableProductOrder,
    navigate?: NavigateFunction,
  ): Promise<boolean> {
    runInAction(() => {
      this.loadingOrderIds.add(order.id);
      this.errorByOrderId.delete(order.id);
    });

    try {
      productOrderRepeatService.repeat(order);

      if (navigate) {
        navigate('/shop/cart');
      }

      runInAction(() => {
        this.loadingOrderIds.delete(order.id);
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.loadingOrderIds.delete(order.id);
        this.errorByOrderId.set(
          order.id,
          error instanceof Error
            ? error.message
            : 'Не удалось повторить заказ.',
        );
      });

      return false;
    }
  }
}

export const productOrdersRepeatStore = new ProductOrdersRepeatStore();