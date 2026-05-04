import { makeAutoObservable, runInAction } from 'mobx';

import { authStore } from '@/features/auth/model/authStore';
import type { RepeatableProductOrder } from '@/features/orders/model/productOrderRepeat';
import { profileService } from '@/features/profile/service/profileService';

import { shopCartStore } from './shopCartStore';
import { shopOrderService } from '../service/shopOrderService';
import { shopService } from '../service/shopService';

import type { CheckoutForm, PickupPoint, Product, Order } from './types';

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

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim();
}

function splitDisplayName(name?: string): {
  firstName?: string;
  lastName?: string;
} {
  if (!name?.trim()) {
    return {};
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
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
  repeatOrder: RepeatableProductOrder | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  loadFromRepeatOrder(order: RepeatableProductOrder): void {
    console.log('[shopCheckoutStore.loadFromRepeatOrder] start', {
      order,
    });

    this.repeatOrder = JSON.parse(JSON.stringify(order));
    this.isInitialized = false;
    this.isLoading = true;
    this.error = null;
    this.validationErrors = {};

    void this.load();
  }

  private prefillRecipientFromAuth(): void {
    const authState = authStore.getState();
    const user = authState.user;

    if (!authState.token || !user) {
      return;
    }

    const fallbackName = splitDisplayName(user.name);

    if (isBlank(this.form.recipient.firstName) && !isBlank(user.firstName)) {
      this.form.recipient.firstName = user.firstName!.trim();
    } else if (
      isBlank(this.form.recipient.firstName) &&
      !isBlank(fallbackName.firstName)
    ) {
      this.form.recipient.firstName = fallbackName.firstName!.trim();
    }

    if (isBlank(this.form.recipient.lastName) && !isBlank(user.lastName)) {
      this.form.recipient.lastName = user.lastName!.trim();
    } else if (isBlank(this.form.recipient.lastName) && !isBlank(fallbackName.lastName)) {
      this.form.recipient.lastName = fallbackName.lastName!.trim();
    }

    if (isBlank(this.form.recipient.email) && !isBlank(user.email)) {
      this.form.recipient.email = user.email.trim();
    }

    if (isBlank(this.form.recipient.phone) && !isBlank(user.phone)) {
      this.form.recipient.phone = user.phone!.trim();
    }
  }

  private async prefillRecipientFromProfile(): Promise<void> {
    const authState = authStore.getState();

    if (!authState.token || !authState.user) {
      return;
    }

    try {
      const profile = await profileService.getProfile();

      runInAction(() => {
        if (isBlank(this.form.recipient.firstName) && !isBlank(profile.firstName)) {
          this.form.recipient.firstName = profile.firstName.trim();
        }

        if (isBlank(this.form.recipient.lastName) && !isBlank(profile.lastName)) {
          this.form.recipient.lastName = profile.lastName.trim();
        }

        if (isBlank(this.form.recipient.email) && !isBlank(profile.email)) {
          this.form.recipient.email = profile.email.trim();
        }

        if (isBlank(this.form.recipient.phone) && !isBlank(profile.phone)) {
          this.form.recipient.phone = profile.phone.trim();
        }

        authStore.updateUser({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        });
      });
    } catch {
      // checkout не должен падать, если профиль не загрузился
    }
  }

  async load(): Promise<void> {
    console.log('[shopCheckoutStore.load] start', {
      repeatOrder: this.repeatOrder,
      cartItems: shopCartStore.items,
    });

    this.prefillRecipientFromAuth();
    await this.prefillRecipientFromProfile();

    const productIds = this.repeatOrder
      ? this.repeatOrder.items.map((item) => item.productId)
      : shopCartStore.items.map((item) => item.productId);

    console.log('[shopCheckoutStore.load] resolved productIds', {
      productIds,
      source: this.repeatOrder ? 'repeatOrder' : 'cart',
    });

    if (productIds.length === 0) {
      runInAction(() => {
        this.products = [];
        this.error = null;
        this.isInitialized = true;
        this.isLoading = false;
      });

      console.log('[shopCheckoutStore.load] empty productIds -> initialized empty');

      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const products = await shopService.getProductsByIds(productIds);

      console.log('[shopCheckoutStore.load] products loaded', {
        count: products.length,
        productIds: products.map((item) => item.id),
      });

      runInAction(() => {
        this.products = products;
        this.isInitialized = true;
      });

      if (this.form.deliveryMethod === 'pickup-point') {
        await this.loadPickupPoints();
      }
    } catch (error) {
      console.error('[shopCheckoutStore.load] error', { error });

      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить оформление заказа.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });

      console.log('[shopCheckoutStore.load] finish', {
        isInitialized: this.isInitialized,
        isLoading: this.isLoading,
        error: this.error,
        detailedItems: this.detailedItems,
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

        if (
          !this.form.pickupPointId ||
          !points.some((point) => point.id === this.form.pickupPointId)
        ) {
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

  setRecipientField(field: keyof CheckoutForm['recipient'], value: string): void {
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
      if (this.form.paymentMethod === 'cash' || this.form.paymentMethod === 'card_courier') {
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
    if (this.repeatOrder) {
      const mapped = this.repeatOrder.items
        .map((item) => {
          const product = this.products.find(
            (productItem) => productItem.id === item.productId,
          );

          if (!product) {
            console.warn(
              '[shopCheckoutStore.detailedItems] product not found for repeat item',
              {
                repeatItem: item,
                loadedProducts: this.products.map((productItem) => productItem.id),
              },
            );

            return null;
          }

          return {
            product,
            quantity: item.quantity,
            lineTotal: item.price * item.quantity,
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

      console.log('[shopCheckoutStore.detailedItems] repeat mapped', {
        repeatOrder: this.repeatOrder,
        mapped,
      });

      return mapped;
    }

    const mapped = this.products
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

    console.log('[shopCheckoutStore.detailedItems] cart mapped', {
      cartItems: shopCartStore.items,
      mapped,
    });

    return mapped;
  }

  get totalItems(): number {
    return this.detailedItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  get isEmpty(): boolean {
    return this.detailedItems.length === 0;
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

    console.log('[shopCheckoutStore.validate] result', {
      nextErrors,
      isEmpty: this.isEmpty,
      detailedItems: this.detailedItems,
      repeatOrder: this.repeatOrder,
    });

    return Object.keys(nextErrors).length === 0;
  }

  async submit(): Promise<Order | null> {
    console.log('[shopCheckoutStore.submit] start', {
      repeatOrder: this.repeatOrder,
      cartItems: shopCartStore.items,
      detailedItems: this.detailedItems,
    });

    if (!this.validate()) {
      console.warn('[shopCheckoutStore.submit] validation failed', {
        validationErrors: this.validationErrors,
      });
      return null;
    }

    this.isSubmitting = true;
    this.error = null;

    try {
      const payloadItems = this.repeatOrder
        ? this.repeatOrder.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        : shopCartStore.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

      console.log('[shopCheckoutStore.submit] payload', {
        form: this.form,
        payloadItems,
        source: this.repeatOrder ? 'repeatOrder' : 'cart',
      });

      const formForSubmit: CheckoutForm = {
        ...JSON.parse(JSON.stringify(this.form)),
        address:
          this.form.deliveryMethod === 'pickup-point'
            ? null
            : JSON.parse(JSON.stringify(this.form.address)),
      };

      const order = await shopOrderService.createOrder({
        form: formForSubmit,
        items: payloadItems,
      });

      runInAction(() => {
        if (!this.repeatOrder) {
          shopCartStore.clearLocal();
        }
      });

      console.log('[shopCheckoutStore.submit] success', { order });

      return order;
    } catch (error) {
      console.error('[shopCheckoutStore.submit] error', { error });

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
    console.log('[shopCheckoutStore.reset]');

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
    this.repeatOrder = null;
  }
}

export const shopCheckoutStore = new ShopCheckoutStore();
