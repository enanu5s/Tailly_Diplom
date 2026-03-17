//src/features/orders/model/ordersStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { ordersService } from '../service/ordersService';

import type { ProductOrder, ServiceOrder, ServicesFilter } from './types';

export class OrdersStore {
  servicesFilter: ServicesFilter = 'all';

  serviceOrders: ServiceOrder[] = [];
  productOrders: ProductOrder[] = [];

  servicesLoading = false;
  servicesError: string | null = null;

  productsLoading = false;
  productsError: string | null = null;

  actionLoadingId: string | null = null;
  actionError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setServicesFilter(v: ServicesFilter) {
    this.servicesFilter = v;
  }

  async loadServices() {
    this.servicesLoading = true;
    this.servicesError = null;
    try {
      const list = await ordersService.getServiceOrders(this.servicesFilter);
      runInAction(() => {
        this.serviceOrders = list;
        this.servicesLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.servicesError = e instanceof Error ? e.message : 'Не удалось загрузить заказы услуг';
        this.servicesLoading = false;
      });
    }
  }

  async loadProducts() {
    this.productsLoading = true;
    this.productsError = null;
    try {
      const list = await ordersService.getProductOrders();
      runInAction(() => {
        this.productOrders = list;
        this.productsLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.productsError = e instanceof Error ? e.message : 'Не удалось загрузить заказы товаров';
        this.productsLoading = false;
      });
    }
  }

  async repeatService(orderId: string) {
    this.actionLoadingId = orderId;
    this.actionError = null;
    try {
      await ordersService.repeatServiceOrder(orderId);
      runInAction(() => {
        this.actionLoadingId = null;
      });
    } catch (e) {
      runInAction(() => {
        this.actionError = e instanceof Error ? e.message : 'Не удалось повторить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async repeatProduct(orderId: string) {
    this.actionLoadingId = orderId;
    this.actionError = null;
    try {
      await ordersService.repeatProductOrder(orderId);
      runInAction(() => {
        this.actionLoadingId = null;
      });
    } catch (e) {
      runInAction(() => {
        this.actionError = e instanceof Error ? e.message : 'Не удалось повторить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async leaveReview(orderId: string, rating: number) {
    this.actionLoadingId = orderId;
    this.actionError = null;
    try {
      await ordersService.leaveServiceReview(orderId, rating);
      runInAction(() => {
        const idx = this.serviceOrders.findIndex((x) => x.id === orderId);
        if (idx >= 0) this.serviceOrders[idx] = { ...this.serviceOrders[idx], hasReview: true, rating };
        this.actionLoadingId = null;
      });
    } catch (e) {
      runInAction(() => {
        this.actionError = e instanceof Error ? e.message : 'Не удалось отправить отзыв';
        this.actionLoadingId = null;
      });
    }
  }
}

export const ordersStore = new OrdersStore();