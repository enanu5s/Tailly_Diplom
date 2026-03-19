import { ordersApi } from '../api/ordersApi';
import { productOrderRepeatCheckoutService } from './productOrderRepeatCheckoutService';

import type {
  CreateServiceOrderPayload,
  LeaveServiceReviewPayload,
  ProductOrder,
  ServicesFilter,
} from '../model/types';

import type { ProductOrderRepeatCheckoutDraft } from '../model/productOrderRepeatCheckout';

export const ordersService = {
  getServiceOrders: (filter: ServicesFilter) =>
    ordersApi.getServiceOrders(filter),

  getServiceOrderById: (orderId: string) =>
    ordersApi.getServiceOrderById(orderId),

  createServiceOrder: (payload: CreateServiceOrderPayload) =>
    ordersApi.createServiceOrder(payload),

  confirmServiceOrder: (orderId: string) =>
    ordersApi.confirmServiceOrder(orderId),

  startServiceOrder: (orderId: string) =>
    ordersApi.startServiceOrder(orderId),

  completeServiceOrder: (orderId: string) =>
    ordersApi.completeServiceOrder(orderId),

  cancelServiceOrder: (orderId: string) =>
    ordersApi.cancelServiceOrder(orderId),

  getProductOrders: () => ordersApi.getProductOrders(),

  repeatServiceOrder: (orderId: string) =>
    ordersApi.repeatServiceOrder(orderId),

  async repeatProductOrder(
    orderId: string,
  ): Promise<ProductOrderRepeatCheckoutDraft> {
    const orders = await ordersApi.getProductOrders();

    const order = orders.find(
      (item): item is ProductOrder => item.id === orderId,
    );

    if (!order) {
      throw new Error('Заказ не найден.');
    }

    if (!('items' in order) || !Array.isArray(order.items)) {
      throw new Error(
        'У товарного заказа нет состава товаров для повторного оформления.',
      );
    }

    const items = order.items
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      }));

    if (items.length === 0) {
      throw new Error('В заказе нет товаров для повторного оформления.');
    }

    const draft: ProductOrderRepeatCheckoutDraft = {
      source: 'repeat_product_order',
      orderId: order.id,
      createdAt: new Date().toISOString(),
      items,
    };

    productOrderRepeatCheckoutService.saveDraft(draft);

    return draft;
  },

  leaveServiceReview: (
    orderId: string,
    payload: LeaveServiceReviewPayload,
  ) => ordersApi.leaveServiceReview(orderId, payload),
};