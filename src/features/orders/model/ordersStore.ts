// src/features/orders/model/ordersStore.ts

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

  setServicesFilter(value: ServicesFilter): void {
    this.servicesFilter = value;
    void this.loadServices();
  }

  async loadServices(): Promise<void> {
    this.servicesLoading = true;
    this.servicesError = null;

    try {
      const list = await ordersService.getServiceOrders(this.servicesFilter);

      runInAction(() => {
        this.serviceOrders = list;
        this.servicesLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.servicesError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить заказы услуг';
        this.servicesLoading = false;
      });
    }
  }

  async loadProducts(): Promise<void> {
    this.productsLoading = true;
    this.productsError = null;

    try {
      const list = await ordersService.getProductOrders();

      runInAction(() => {
        this.productOrders = list;
        this.productsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.productsError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить заказы товаров';
        this.productsLoading = false;
      });
    }
  }

  async repeatService(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.repeatServiceOrder(orderId);

      runInAction(() => {
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось повторить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async repeatProduct(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.repeatProductOrder(orderId);

      runInAction(() => {
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось повторить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async completeService(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.completeServiceOrder(orderId);

      runInAction(() => {
        const index = this.serviceOrders.findIndex((item) => item.id === orderId);

        if (index >= 0) {
          this.serviceOrders[index] = {
            ...this.serviceOrders[index],
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
        }

        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось завершить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async leaveReview(orderId: string, rating: number): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.leaveServiceReview(orderId, rating);

      runInAction(() => {
        const index = this.serviceOrders.findIndex((item) => item.id === orderId);

        if (index >= 0) {
          this.serviceOrders[index] = {
            ...this.serviceOrders[index],
            hasReview: true,
            rating,
          };
        }

        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось отправить отзыв';
        this.actionLoadingId = null;
      });
    }
  }
}

export const ordersStore = new OrdersStore();