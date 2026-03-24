// src/shared/lib/auth/roleAccess.ts
import type { AuthUser, UserRole } from '@/features/auth/model/authStore';

export function isAuthenticatedRole(role?: UserRole): boolean {
  return (
    role === 'client' ||
    role === 'specialist' ||
    role === 'admin' ||
    role === 'super_admin'
  );
}

export function isClientRole(role?: UserRole): boolean {
  return role === 'client';
}

export function isAdminRole(role?: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminRole(role?: UserRole): boolean {
  return role === 'super_admin';
}

export function canAccessClientArea(user: AuthUser | null): boolean {
  if (!user || user.isBlocked) {
    return false;
  }

  return isClientRole(user.role);
}

export function canAccessAdminArea(user: AuthUser | null): boolean {
  if (!user || user.isBlocked) {
    return false;
  }

  return isAdminRole(user.role);
}

export function canAccessSuperAdminArea(user: AuthUser | null): boolean {
  if (!user || user.isBlocked) {
    return false;
  }

  return isSuperAdminRole(user.role);
}

/** Заказ товаров в магазине: клиент и специалист; администраторы не могут. */
export function canOrderShopProducts(user: AuthUser | null): boolean {
  if (!user || user.isBlocked) {
    return false;
  }

  return user.role === 'client' || user.role === 'specialist';
}

/** Заказ услуги у специалиста: только клиент. */
export function canClientBookService(user: AuthUser | null): boolean {
  if (!user || user.isBlocked) {
    return false;
  }

  return user.role === 'client';
}

/**
 * Избранное, корзина и связанные кнопки в магазине не показываем администраторам.
 * У гостя (без user) — показываем.
 */
export function shouldShowShopConsumerControls(
  user: AuthUser | null | undefined,
): boolean {
  if (!user) {
    return true;
  }

  if (user.isBlocked) {
    return false;
  }

  return !isAdminRole(user.role);
}

export function getDefaultAuthorizedRoute(user: AuthUser | null): string {
  if (!user) {
    return '/login';
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    return '/admin';
  }

  if (user.role === 'specialist' && user.specialistSlug) {
    return `/specialists/${user.specialistSlug}`;
  }

  return '/profile';
}