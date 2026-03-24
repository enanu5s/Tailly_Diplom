// src/features/orders/service/ordersService.ts

import { authStore } from '@/features/auth/model/authStore';
import { canClientBookService, canOrderShopProducts } from '@/shared/lib/auth/roleAccess';

import { ordersApi } from '../api/ordersApi';

import type { ProductOrderRepeatCheckoutDraft } from '../model/productOrderRepeatCheckout';
import type {
  CancelOrderResult,
  CompleteOrderResult,
  ConfirmOrderResult,
  CreateServiceOrderPayload,
  LeaveServiceReviewPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
  StartOrderResult,
} from '../model/types';

export const ordersService = {
  getServiceOrders(filter: ServicesFilter): Promise<ServiceOrder[]> {
    return ordersApi.getServiceOrders(filter);
  },

  getServiceOrderById(orderId: string): Promise<ServiceOrder> {
    return ordersApi.getServiceOrderById(orderId);
  },

  createServiceOrder(payload: CreateServiceOrderPayload): Promise<ServiceOrder> {
    const user = authStore.getState().user;

    if (!canClientBookService(user)) {
      return Promise.reject(new Error('Заказывать услуги могут только клиенты.'));
    }

    return ordersApi.createServiceOrder(payload);
  },

  confirmServiceOrder(orderId: string): Promise<ConfirmOrderResult> {
    return ordersApi.confirmServiceOrder(orderId);
  },

  startServiceOrder(orderId: string): Promise<StartOrderResult> {
    return ordersApi.startServiceOrder(orderId);
  },

  completeServiceOrder(orderId: string): Promise<CompleteOrderResult> {
    return ordersApi.completeServiceOrder(orderId);
  },

  cancelServiceOrder(orderId: string): Promise<CancelOrderResult> {
    return ordersApi.cancelServiceOrder(orderId);
  },

  getProductOrders(): Promise<ProductOrder[]> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      return Promise.resolve([]);
    }

    return ordersApi.getProductOrders();
  },

  getProductOrderById(orderId: string): Promise<ProductOrder> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      return Promise.reject(new Error('Заказ не найден.'));
    }

    return ordersApi.getProductOrderById(orderId);
  },

  cancelProductOrder(orderId: string): Promise<CancelOrderResult> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      return Promise.reject(new Error('Заказ не найден.'));
    }

    return ordersApi.cancelProductOrder(orderId);
  },

  repeatServiceOrder(orderId: string): Promise<RepeatResult> {
    return ordersApi.repeatServiceOrder(orderId);
  },

  repeatProductOrder(orderId: string): Promise<ProductOrderRepeatCheckoutDraft> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      return Promise.reject(new Error('Заказ не найден.'));
    }

    return ordersApi.repeatProductOrder(orderId);
  },

  leaveServiceReview(
    orderId: string,
    payload: LeaveServiceReviewPayload,
  ): Promise<ReviewResult> {
    return ordersApi.leaveServiceReview(orderId, payload);
  },
};
