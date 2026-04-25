import { makeAutoObservable, runInAction } from 'mobx';

import { ordersService } from '../service/ordersService';

import type { ProductOrderRepeatCheckoutDraft } from './productOrderRepeatCheckout';
import type {
  LeaveServiceReviewPayload,
  OrderStatus,
  ProductOrder,
  ServiceOrder,
  ServicesFilter,
} from './types';

export class OrdersStore {
  servicesFilter: ServicesFilter = 'all';
  serviceOrders: ServiceOrder[] = [];
  productOrders: ProductOrder[] = [];
  selectedProductOrder: ProductOrder | null = null;

  servicesLoading = false;
  servicesError: string | null = null;

  productsLoading = false;
  productsError: string | null = null;

  selectedProductLoading = false;
  selectedProductError: string | null = null;

  actionLoadingId: string | null = null;
  actionError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setServicesFilter(value: ServicesFilter): void {
    this.servicesFilter = value;
    void this.loadServices();
  }

  clearSelectedProductOrder(): void {
    this.selectedProductOrder = null;
    this.selectedProductError = null;
    this.selectedProductLoading = false;
  }

  /** Сброс кэша товарных заказов при смене пользователя (гость / другой аккаунт). */
  resetSessionProductOrders(): void {
    this.productOrders = [];
    this.productsError = null;
    this.productsLoading = false;
    this.clearSelectedProductOrder();
  }

  private updateLocalOrder(orderId: string, patch: Partial<ServiceOrder>): void {
    const index = this.serviceOrders.findIndex((item) => item.id === orderId);

    if (index === -1) {
      return;
    }

    this.serviceOrders[index] = {
      ...this.serviceOrders[index],
      ...patch,
    };
  }

  /** Синхронно с бэкендом: новый статус, метка времени и событие в истории. */
  private applyServiceOrderTransition(orderId: string, nextStatus: OrderStatus): void {
    const index = this.serviceOrders.findIndex((item) => item.id === orderId);

    if (index === -1) {
      return;
    }

    const order = this.serviceOrders[index];
    const changedAt = new Date().toISOString();

    const timestamps: Partial<ServiceOrder> = {};
    if (nextStatus === 'confirmed') {
      timestamps.confirmedAt = changedAt;
    } else if (nextStatus === 'active') {
      timestamps.startedAt = changedAt;
    } else if (nextStatus === 'completed') {
      timestamps.completedAt = changedAt;
    } else if (nextStatus === 'canceled') {
      timestamps.canceledAt = changedAt;
    }

    this.serviceOrders[index] = {
      ...order,
      ...timestamps,
      status: nextStatus,
      lifecycle: [...order.lifecycle, { status: nextStatus, changedAt }],
    };
  }

  private updateLocalProductOrder(orderId: string, patch: Partial<ProductOrder>): void {
    const index = this.productOrders.findIndex((item) => item.id === orderId);

    if (index !== -1) {
      this.productOrders[index] = {
        ...this.productOrders[index],
        ...patch,
      };
    }

    if (this.selectedProductOrder?.id === orderId) {
      this.selectedProductOrder = {
        ...this.selectedProductOrder,
        ...patch,
      };
    }
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
          error instanceof Error ? error.message : 'Не удалось загрузить заказы услуг';
        this.servicesLoading = false;
      });
    }
  }

  async loadProducts(): Promise<void> {
    this.productsLoading = true;
    this.productsError = null;

    try {
      await ordersService.syncProductOrdersStatuses();
      const list = await ordersService.getProductOrders();

      runInAction(() => {
        this.productOrders = list;
        this.productsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.productsError =
          error instanceof Error ? error.message : 'Не удалось загрузить заказы товаров';
        this.productsLoading = false;
      });
    }
  }

  async loadProductById(orderId: string): Promise<void> {
    this.selectedProductLoading = true;
    this.selectedProductError = null;

    try {
      await ordersService.syncProductOrderStatus(orderId);
      const order = await ordersService.getProductOrderById(orderId);

      runInAction(() => {
        this.selectedProductOrder = order;
        this.selectedProductLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.selectedProductError =
          error instanceof Error ? error.message : 'Не удалось загрузить заказ товара';
        this.selectedProductLoading = false;
      });
    }
  }

  async syncSelectedProductOrderStatus(): Promise<void> {
    const current = this.selectedProductOrder;

    if (!current) {
      return;
    }

    try {
      const synced = await ordersService.syncProductOrderStatus(current.id);

      runInAction(() => {
        this.selectedProductOrder = synced;

        const index = this.productOrders.findIndex((item) => item.id === synced.id);
        if (index !== -1) {
          this.productOrders[index] = synced;
        }
      });
    } catch {
      // Фоновая синхронизация не должна ломать интерфейс ошибками.
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

  async repeatProduct(orderId: string): Promise<ProductOrderRepeatCheckoutDraft | null> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      const draft = await ordersService.repeatProductOrder(orderId);

      runInAction(() => {
        this.actionLoadingId = null;
      });

      return draft;
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось повторить заказ';
        this.actionLoadingId = null;
      });

      return null;
    }
  }

  async cancelProduct(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.cancelProductOrder(orderId);

      const canceledAt = new Date().toISOString();

      runInAction(() => {
        const currentLifecycle =
          this.selectedProductOrder?.id === orderId
            ? (this.selectedProductOrder.lifecycle ?? [])
            : (this.productOrders.find((item) => item.id === orderId)?.lifecycle ?? []);

        this.updateLocalProductOrder(orderId, {
          status: 'canceled',
          canceledAt,
          cancelReason: 'Отменено пользователем',
          payment:
            this.selectedProductOrder?.id === orderId
              ? this.selectedProductOrder.payment
                ? {
                    ...this.selectedProductOrder.payment,
                    status:
                      this.selectedProductOrder.payment.status === 'paid'
                        ? 'refunded'
                        : this.selectedProductOrder.payment.status,
                  }
                : undefined
              : undefined,
          lifecycle: [
            ...currentLifecycle,
            {
              status: 'canceled',
              changedAt: canceledAt,
              comment: 'Пользователь отменил заказ',
            },
          ],
        });
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось отменить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async confirmService(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.confirmServiceOrder(orderId);

      runInAction(() => {
        this.applyServiceOrderTransition(orderId, 'confirmed');
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось подтвердить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async startService(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.startServiceOrder(orderId);

      runInAction(() => {
        this.applyServiceOrderTransition(orderId, 'active');
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось начать заказ';
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
        this.applyServiceOrderTransition(orderId, 'completed');
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

  async cancelService(orderId: string): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      await ordersService.cancelServiceOrder(orderId);

      runInAction(() => {
        this.applyServiceOrderTransition(orderId, 'canceled');
        this.actionLoadingId = null;
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось отменить заказ';
        this.actionLoadingId = null;
      });
    }
  }

  async leaveReview(orderId: string, payload: LeaveServiceReviewPayload): Promise<void> {
    this.actionLoadingId = orderId;
    this.actionError = null;

    try {
      const result = await ordersService.leaveServiceReview(orderId, payload);

      runInAction(() => {
        this.updateLocalOrder(orderId, {
          hasReview: true,
          rating: payload.rating,
          review: result.review ?? {
            rating: payload.rating,
            comment: payload.comment.trim(),
            photos: payload.photos,
            createdAt: new Date().toISOString(),
            specialistReply: null,
          },
        });
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
