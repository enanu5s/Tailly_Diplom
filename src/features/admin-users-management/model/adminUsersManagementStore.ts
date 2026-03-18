// src/features/admin-users-management/model/adminUsersManagementStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { adminUsersManagementService } from '../service/adminUsersManagementService';
import type {
  ManagedUser,
  ManagedUserRole,
} from './types';

type RoleFilter = 'all' | ManagedUserRole;

function buildBlockedUntilValue(days: number): string {
  const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

class AdminUsersManagementStore {
  users: ManagedUser[] = [];

  isLoading = false;
  loadError = '';

  search = '';
  roleFilter: RoleFilter = 'all';

  changingUserId: string | null = null;
  changeError = '';
  successMessage = '';

  isBlockModalOpen = false;
  selectedUser: ManagedUser | null = null;
  blockReason = '';
  blockedUntil = '';
  isPermanentBlock = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setSearch(value: string): void {
    this.search = value;
  }

  setRoleFilter(value: RoleFilter): void {
    this.roleFilter = value;
  }

  setBlockReason(value: string): void {
    this.blockReason = value;
  }

  setBlockedUntil(value: string): void {
    this.blockedUntil = value;
  }

  setPermanentBlock(value: boolean): void {
    this.isPermanentBlock = value;

    if (value) {
      this.blockedUntil = '';
    }
  }

  applyQuickBlockPeriod(days: number): void {
    this.isPermanentBlock = false;
    this.blockedUntil = buildBlockedUntilValue(days);
  }

  openBlockModal(user: ManagedUser): void {
    this.selectedUser = user;
    this.blockReason = '';
    this.blockedUntil = '';
    this.isPermanentBlock = false;
    this.changeError = '';
    this.isBlockModalOpen = true;
  }

  closeBlockModal(): void {
    this.isBlockModalOpen = false;
    this.selectedUser = null;
    this.blockReason = '';
    this.blockedUntil = '';
    this.isPermanentBlock = false;
  }

  get canSubmitBlock(): boolean {
    return (
      Boolean(this.selectedUser) &&
      !this.changingUserId &&
      this.blockReason.trim().length > 0 &&
      (this.isPermanentBlock || this.blockedUntil.trim().length > 0)
    );
  }

  get filteredUsers(): ManagedUser[] {
    const normalizedSearch = this.search.trim().toLowerCase();

    return this.users.filter((user) => {
      const matchesRole =
        this.roleFilter === 'all' || user.role === this.roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        user.email,
        user.name,
        user.firstName,
        user.lastName,
        user.middleName,
        user.specialistSlug,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }

  get clientsCount(): number {
    return this.users.filter((user) => user.role === 'client').length;
  }

  get specialistsCount(): number {
    return this.users.filter((user) => user.role === 'specialist').length;
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const users = await adminUsersManagementService.getUsers();

      runInAction(() => {
        this.users = users;
      });
    } catch (error) {
      runInAction(() => {
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить пользователей.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async confirmBlock(): Promise<void> {
    if (!this.selectedUser) {
      return;
    }

    const targetUser = this.selectedUser;

    runInAction(() => {
      this.changingUserId = targetUser.id;
      this.changeError = '';
      this.successMessage = '';
    });

    try {
      const updatedUser =
        await adminUsersManagementService.updateBlockedStatus({
          userId: targetUser.id,
          isBlocked: true,
          blockReason: this.blockReason.trim(),
          blockedUntil: this.isPermanentBlock ? undefined : this.blockedUntil,
          isPermanentBlock: this.isPermanentBlock,
        });

      runInAction(() => {
        this.users = this.users.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        );
        this.successMessage = updatedUser.isPermanentBlock
          ? `Пользователь ${updatedUser.email} заблокирован навсегда.`
          : `Пользователь ${updatedUser.email} заблокирован до ${
              updatedUser.blockedUntil ?? 'указанной даты'
            }.`;
        this.closeBlockModal();
      });
    } catch (error) {
      runInAction(() => {
        this.changeError =
          error instanceof Error
            ? error.message
            : 'Не удалось заблокировать пользователя.';
      });
    } finally {
      runInAction(() => {
        this.changingUserId = null;
      });
    }
  }

  async unblockUser(user: ManagedUser): Promise<void> {
    runInAction(() => {
      this.changingUserId = user.id;
      this.changeError = '';
      this.successMessage = '';
    });

    try {
      const updatedUser =
        await adminUsersManagementService.updateBlockedStatus({
          userId: user.id,
          isBlocked: false,
        });

      runInAction(() => {
        this.users = this.users.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        );
        this.successMessage = `Пользователь ${updatedUser.email} разблокирован.`;
      });
    } catch (error) {
      runInAction(() => {
        this.changeError =
          error instanceof Error
            ? error.message
            : 'Не удалось разблокировать пользователя.';
      });
    } finally {
      runInAction(() => {
        this.changingUserId = null;
      });
    }
  }

  resetFeedback(): void {
    this.changeError = '';
    this.successMessage = '';
  }
}

export const adminUsersManagementStore =
  new AdminUsersManagementStore();