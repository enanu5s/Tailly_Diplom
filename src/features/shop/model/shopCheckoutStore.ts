// src/features/shop/model/shopCheckoutStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { shopService } from '../service/shopService';
import { shopOrderService } from '../service/shopOrderService';
import { shopCartStore } from './shopCartStore';
import type {
    CheckoutForm,
    PickupPoint,
    Product,
    Order,
} from './types';

type CheckoutValidationErrors = Partial<
    Record<
        | 'firstName'
        | 'lastName'
        | 'phone'
        | 'email'
        | 'city'
        | 'street'
        | 'house'
        | 'pickupPointId'
        | 'cart',
        string
    >
>;

function createDefaultForm(): CheckoutForm {
    return {
        recipient: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
        },
        deliveryMethod: 'courier',
        address: {
            city: 'Москва',
            street: '',
            house: '',
            apartment: '',
            comment: '',
        },
        pickupPointId: null,
        paymentMethod: 'card',
    };
}

export class ShopCheckoutStore {
    form: CheckoutForm = JSON.parse(JSON.stringify(createDefaultForm()));
    products: Product[] = [];
    pickupPoints: PickupPoint[] = [];
    isLoading = false;
    isPickupPointsLoading = false;
    isSubmitting = false;
    error: string | null = null;
    pickupPointsError: string | null = null;
    validationErrors: CheckoutValidationErrors = {};
    isInitialized = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async load(): Promise<void> {
        const productIds = shopCartStore.items.map((item) => item.productId);

        if (productIds.length === 0) {
            runInAction(() => {
                this.products = [];
                this.error = null;
                this.isInitialized = true;
                this.isLoading = false;
            });

            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const products = await shopService.getProductsByIds(productIds);

            runInAction(() => {
                this.products = products;
                this.isInitialized = true;
            });

            if (this.form.deliveryMethod === 'pickup-point') {
                await this.loadPickupPoints();
            }
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить оформление заказа.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async loadPickupPoints(): Promise<void> {
        this.isPickupPointsLoading = true;
        this.pickupPointsError = null;

        try {
            const points = await shopOrderService.getPickupPoints(this.form.address.city);

            runInAction(() => {
                this.pickupPoints = points;

                if (points.length === 0) {
                    this.form.pickupPointId = null;
                    return;
                }

                if (!this.form.pickupPointId || !points.some((point) => point.id === this.form.pickupPointId)) {
                    this.form.pickupPointId = points[0].id;
                }
            });
        } catch (error) {
            runInAction(() => {
                this.pickupPointsError =
                    error instanceof Error ? error.message : 'Не удалось загрузить ПВЗ.';
            });
        } finally {
            runInAction(() => {
                this.isPickupPointsLoading = false;
            });
        }
    }

    setRecipientField(
        field: keyof CheckoutForm['recipient'],
        value: string,
    ): void {
        this.form.recipient[field] = value;
        delete this.validationErrors[field as keyof CheckoutValidationErrors];
    }

    setAddressField(field: keyof CheckoutForm['address'], value: string): void {
        this.form.address[field] = value;

        if (field === 'city') {
            delete this.validationErrors.city;
        }

        if (field === 'street') {
            delete this.validationErrors.street;
        }

        if (field === 'house') {
            delete this.validationErrors.house;
        }
    }

    async setDeliveryMethod(value: CheckoutForm['deliveryMethod']): Promise<void> {
        this.form.deliveryMethod = value;

        if (value === 'courier') {
            this.form.pickupPointId = null;
        }

        if (value === 'pickup-point') {
            if (this.form.paymentMethod === 'cash') {
                this.form.paymentMethod = 'card';
            }
            await this.loadPickupPoints();
        }
    }

    setPaymentMethod(value: CheckoutForm['paymentMethod']): void {
        this.form.paymentMethod = value;
    }

    setPickupPointId(value: string): void {
        this.form.pickupPointId = value;
        delete this.validationErrors.pickupPointId;
    }

    get detailedItems(): Array<{
        product: Product;
        quantity: number;
        lineTotal: number;
    }> {
        return this.products
            .map((product) => {
                const quantity = shopCartStore.getQuantity(product.id);

                if (quantity <= 0) {
                    return null;
                }

                return {
                    product,
                    quantity,
                    lineTotal: product.price * quantity,
                };
            })
            .filter(
                (
                    item,
                ): item is {
                    product: Product;
                    quantity: number;
                    lineTotal: number;
                } => item !== null,
            );
    }

    get totalItems(): number {
        return this.detailedItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    get totalPrice(): number {
        return this.detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    get isEmpty(): boolean {
        return shopCartStore.items.length === 0;
    }

    private validateEmail(value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    private validatePhone(value: string): boolean {
        const normalized = value.replace(/[^\d+]/g, '');
        return normalized.length >= 11;
    }

    validate(): boolean {
        const nextErrors: CheckoutValidationErrors = {};

        if (this.isEmpty) {
            nextErrors.cart = 'Корзина пуста.';
        }

        if (!this.form.recipient.firstName.trim()) {
            nextErrors.firstName = 'Укажи имя.';
        }

        if (!this.form.recipient.lastName.trim()) {
            nextErrors.lastName = 'Укажи фамилию.';
        }

        if (!this.validatePhone(this.form.recipient.phone)) {
            nextErrors.phone = 'Укажи корректный номер телефона.';
        }

        if (!this.validateEmail(this.form.recipient.email)) {
            nextErrors.email = 'Укажи корректный email.';
        }

        if (!this.form.address.city.trim()) {
            nextErrors.city = 'Укажи город.';
        }

        if (this.form.deliveryMethod === 'courier') {
            if (!this.form.address.street.trim()) {
                nextErrors.street = 'Укажи улицу.';
            }

            if (!this.form.address.house.trim()) {
                nextErrors.house = 'Укажи дом.';
            }
        }

        if (this.form.deliveryMethod === 'pickup-point' && !this.form.pickupPointId) {
            nextErrors.pickupPointId = 'Выбери ПВЗ.';
        }

        this.validationErrors = nextErrors;

        return Object.keys(nextErrors).length === 0;
    }

    async submit(): Promise<Order | null> {
        if (!this.validate()) {
            return null;
        }

        this.isSubmitting = true;
        this.error = null;

        try {
            const order = await shopOrderService.createOrder({
                form: JSON.parse(JSON.stringify(this.form)),
                items: shopCartStore.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });

            runInAction(() => {
                shopCartStore.clear();
            });

            return order;
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось оформить заказ.';
            });

            return null;
        } finally {
            runInAction(() => {
                this.isSubmitting = false;
            });
        }
    }

    reset(): void {
        this.form = JSON.parse(JSON.stringify(createDefaultForm()));
        this.products = [];
        this.pickupPoints = [];
        this.isLoading = false;
        this.isPickupPointsLoading = false;
        this.isSubmitting = false;
        this.error = null;
        this.pickupPointsError = null;
        this.validationErrors = {};
        this.isInitialized = false;
    }
}

export const shopCheckoutStore = new ShopCheckoutStore();