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
 * Один аккаунт (одна почта) с ролями клиент и специалист: в сессии «клиент»
 * пользователь не должен бронировать услуги у своего же профиля специалиста.
 */
export function isClientBlockedFromBookingOwnSpecialist(
  user: AuthUser | null,
  target: { slug?: string; id?: string },
): boolean {
  if (!user || user.isBlocked || user.role !== 'client') {
    return false;
  }

  const ownId = user.specialistId?.trim();
  const ownSlug = user.specialistSlug?.trim();
  const targetId = target.id?.trim();
  const targetSlug = target.slug?.trim();

  if (!ownId && !ownSlug) {
    return false;
  }

  if (ownId && targetId && ownId === targetId) {
    return true;
  }

  if (ownSlug && targetSlug && ownSlug.toLowerCase() === targetSlug.toLowerCase()) {
    return true;
  }

  return false;
}

/** Можно ли клиенту оформить услугу у указанного специалиста (не у себя). */
export function canClientBookSpecialist(
  user: AuthUser | null,
  target: { slug?: string; id?: string },
): boolean {
  if (!canClientBookService(user)) {
    return false;
  }

  return !isClientBlockedFromBookingOwnSpecialist(user, target);
}

/**
 * Клиент в сессии «клиент» открывает профиль специалиста, привязанный к тому же аккаунту
 * (та же почта / роли client+specialist). Для такого случая скрываем запись, чат и «связаться».
 */
export function isClientViewingOwnSpecialistProfile(
  user: AuthUser | null,
  target: { slug?: string; id?: string },
): boolean {
  return isClientBlockedFromBookingOwnSpecialist(user, target);
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
