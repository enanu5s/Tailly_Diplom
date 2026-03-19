//src/features/orders/service/productOrderRepeatCheckoutService.ts

import type { ProductOrderRepeatCheckoutDraft } from '../model/productOrderRepeatCheckout';

const PRODUCT_REPEAT_CHECKOUT_DRAFT_KEY =
  'tailly_product_repeat_checkout_draft';

class ProductOrderRepeatCheckoutService {
  saveDraft(draft: ProductOrderRepeatCheckoutDraft): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      PRODUCT_REPEAT_CHECKOUT_DRAFT_KEY,
      JSON.stringify(JSON.parse(JSON.stringify(draft))),
    );

    window.dispatchEvent(
      new CustomEvent('tailly:product-repeat-checkout-draft-updated', {
        detail: {
          orderId: draft.orderId,
        },
      }),
    );
  }

  readDraft(): ProductOrderRepeatCheckoutDraft | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const rawValue = window.localStorage.getItem(
        PRODUCT_REPEAT_CHECKOUT_DRAFT_KEY,
      );

      if (!rawValue) {
        return null;
      }

      const parsed = JSON.parse(rawValue) as unknown;

      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      const draft = parsed as Partial<ProductOrderRepeatCheckoutDraft>;

      if (
        draft.source !== 'repeat_product_order' ||
        typeof draft.orderId !== 'string' ||
        typeof draft.createdAt !== 'string' ||
        !Array.isArray(draft.items)
      ) {
        return null;
      }

      return draft as ProductOrderRepeatCheckoutDraft;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(PRODUCT_REPEAT_CHECKOUT_DRAFT_KEY);

    window.dispatchEvent(
      new CustomEvent('tailly:product-repeat-checkout-draft-updated', {
        detail: {
          orderId: null,
        },
      }),
    );
  }
}

export const productOrderRepeatCheckoutService =
  new ProductOrderRepeatCheckoutService();