//src/features/orders/service/ordersService.ts
import { ordersApi } from '../api/ordersApi';

import type { ServicesFilter } from '../model/types';

export const ordersService = {
  getServiceOrders: (filter: ServicesFilter) => ordersApi.getServiceOrders(filter),
  getProductOrders: () => ordersApi.getProductOrders(),
  repeatServiceOrder: (orderId: string) => ordersApi.repeatServiceOrder(orderId),
  repeatProductOrder: (orderId: string) => ordersApi.repeatProductOrder(orderId),
  leaveServiceReview: (orderId: string, rating: number) => ordersApi.leaveServiceReview(orderId, rating),
};