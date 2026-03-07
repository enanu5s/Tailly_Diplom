// src/features/shop/api/shopOrderApi.ts
import { fetchJson } from '@/shared/api/fetchJson';

import { SHOP_PRODUCTS_MOCK } from './mockData';

import type {
    CartDetailedItem,
    CheckoutForm,
    Order,
    PickupPoint,
    Product,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const ORDERS_STORAGE_KEY = 'tailly_shop_orders';

type OrderLineInput = {
    productId: string;
    quantity: number;
};

export type CreateOrderPayload = {
    form: CheckoutForm;
    items: OrderLineInput[];
};

const PICKUP_POINTS_MOCK: PickupPoint[] = [
    {
        id: 'pickup-cdek-1',
        provider: 'cdek',
        title: 'СДЭК — ПВЗ на Тверской',
        address: 'Москва, ул. Тверская, д. 12',
        estimatedDate: '2026-03-11',
    },
    {
        id: 'pickup-cdek-2',
        provider: 'cdek',
        title: 'СДЭК — ПВЗ на Арбате',
        address: 'Москва, ул. Арбат, д. 21',
        estimatedDate: '2026-03-12',
    },
    {
        id: 'pickup-cdek-3',
        provider: 'cdek',
        title: 'СДЭК — ПВЗ на Ленинском',
        address: 'Москва, Ленинский проспект, д. 41',
        estimatedDate: '2026-03-12',
    },
];

function readStoredOrders(): Order[] {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed as Order[];
    } catch {
        return [];
    }
}

function writeStoredOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function addDays(date: Date, days: number): string {
    const next = new Date(date);
    next.setDate(next.getDate() + days);

    return next.toISOString();
}

function buildDetailedItems(items: OrderLineInput[], products: Product[]): CartDetailedItem[] {
    return items
        .map((item) => {
            const product = products.find((entry) => entry.id === item.productId);

            if (!product || item.quantity <= 0) {
                return null;
            }

            return {
                product,
                quantity: item.quantity,
                lineTotal: product.price * item.quantity,
            };
        })
        .filter((item): item is CartDetailedItem => item !== null);
}

function generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getPickupPointsMock(city?: string): Promise<PickupPoint[]> {
    const normalizedCity = city?.trim().toLowerCase() ?? '';

    if (!normalizedCity) {
        return PICKUP_POINTS_MOCK;
    }

    return PICKUP_POINTS_MOCK.filter((point) =>
        point.address.toLowerCase().includes(normalizedCity),
    );
}

async function createOrderMock(payload: CreateOrderPayload): Promise<Order> {
    const productIds = payload.items.map((item) => item.productId);
    const products = SHOP_PRODUCTS_MOCK.filter((product) => productIds.includes(product.id));
    const detailedItems = buildDetailedItems(payload.items, products);
    const totalPrice = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const estimatedDeliveryDate =
        payload.form.deliveryMethod === 'courier'
            ? addDays(new Date(), 1)
            : addDays(new Date(), 2);

    const order: Order = {
        id: generateOrderId(),
        status: payload.form.paymentMethod === 'card' || payload.form.paymentMethod === 'sbp'
            ? 'paid'
            : 'created',
        items: detailedItems,
        totalPrice,
        deliveryMethod: payload.form.deliveryMethod,
        paymentMethod: payload.form.paymentMethod,
        estimatedDeliveryDate,
        createdAt: new Date().toISOString(),
        canBeCancelled: true,
    };

    const existingOrders = readStoredOrders();
    writeStoredOrders([order, ...existingOrders]);

    return order;
}

async function getOrderByIdMock(orderId: string): Promise<Order | null> {
    const orders = readStoredOrders();
    return orders.find((order) => order.id === orderId) ?? null;
}

async function getPickupPointsReal(city?: string): Promise<PickupPoint[]> {
    const params = new URLSearchParams();

    if (city?.trim()) {
        params.set('city', city.trim());
    }
    return fetchJson<PickupPoint[]>(`${API_BASE_URL}/shop/pickup-points?${params.toString()}`);
}

async function createOrderReal(payload: CreateOrderPayload): Promise<Order> {
    return fetchJson<Order>(`${API_BASE_URL}/shop/orders`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

async function getOrderByIdReal(orderId: string): Promise<Order | null> {
    return fetchJson<Order | null>(`${API_BASE_URL}/shop/orders/${orderId}`);
}

export const shopOrderApi = {
    async getPickupPoints(city?: string): Promise<PickupPoint[]> {
        if (USE_MOCK) {
            return getPickupPointsMock(city);
        }

        return getPickupPointsReal(city);
    },

    async createOrder(payload: CreateOrderPayload): Promise<Order> {
        if (USE_MOCK) {
            return createOrderMock(payload);
        }

        return createOrderReal(payload);
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        if (USE_MOCK) {
            return getOrderByIdMock(orderId);
        }

        return getOrderByIdReal(orderId);
    },
};