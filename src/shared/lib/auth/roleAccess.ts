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

export function isAdminRole(role?: UserRole): boolean {
    return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminRole(role?: UserRole): boolean {
    return role === 'super_admin';
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