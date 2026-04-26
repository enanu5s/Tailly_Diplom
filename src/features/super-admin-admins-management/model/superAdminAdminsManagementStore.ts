// src/features/super-admin-admins-management/model/superAdminAdminsManagementStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { superAdminAdminsManagementService } from '../service/superAdminAdminsManagementService';

import type { CreateAdminPayload, ManagedAdmin, UpdateAdminPayload } from './types';

function buildBlockedUntilValue(days: number): string {
  const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

type CreateAdminForm = {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  position: string;
  department: string;
  consent: boolean;
};

function createInitialForm(): CreateAdminForm {
  return {
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    position: '',
    department: '',
    consent: false,
  };
}

type EditAdminForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  position: string;
  department: string;
};

function adminToEditForm(admin: ManagedAdmin): EditAdminForm {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    middleName: admin.middleName ?? '',
    birthDate: admin.birthDate,
    phone: admin.phone ?? '',
    position: admin.position ?? '',
    department: admin.department ?? '',
  };
}

type PendingAdminDeletion = {
  admin: ManagedAdmin;
  index: number;
  timeoutId: number;
};

class SuperAdminAdminsManagementStore {
  private static readonly PAGE_SIZE = 10;

  admins: ManagedAdmin[] = [];
  isLoading = false;
  loadError = '';
  currentPage = 1;

  isCreateModalOpen = false;
  isCreating = false;
  createError = '';
  createdTemporaryPassword = '';
  recentlyCreatedAdminEmail = '';

  deletingAdminId: string | null = null;
  deleteError = '';
  pendingAdminDeletion: PendingAdminDeletion | null = null;

  isEditModalOpen = false;
  editingAdminId: string | null = null;
  editingAdminEmail = '';
  isUpdating = false;
  updateError = '';
  editForm: EditAdminForm = {
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    position: '',
    department: '',
  };

  form: CreateAdminForm = createInitialForm();

  changingAdminId: string | null = null;
  changeError = '';
  successMessage = '';

  isBlockModalOpen = false;
  selectedAdmin: ManagedAdmin | null = null;
  blockReason = '';
  blockedUntil = '';
  isPermanentBlock = false;
  selectedQuickBlockDays: number | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  openCreateModal(): void {
    this.closeBlockModal();
    this.isCreateModalOpen = true;
    this.createError = '';
    this.createdTemporaryPassword = '';
    this.recentlyCreatedAdminEmail = '';
    this.form = createInitialForm();
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.createError = '';
    this.createdTemporaryPassword = '';
    this.recentlyCreatedAdminEmail = '';
    this.form = createInitialForm();
  }

  setFormField<K extends keyof CreateAdminForm>(key: K, value: CreateAdminForm[K]): void {
    this.form[key] = value;
  }

  openEditModal(admin: ManagedAdmin): void {
    if (admin.role === 'super_admin') {
      return;
    }

    this.closeBlockModal();

    this.isEditModalOpen = true;
    this.editingAdminId = admin.adminId;
    this.editingAdminEmail = admin.email;
    this.updateError = '';
    this.editForm = adminToEditForm(admin);
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingAdminId = null;
    this.editingAdminEmail = '';
    this.updateError = '';
    this.editForm = {
      firstName: '',
      lastName: '',
      middleName: '',
      birthDate: '',
      phone: '',
      position: '',
      department: '',
    };
  }

  setEditFormField<K extends keyof EditAdminForm>(key: K, value: EditAdminForm[K]): void {
    this.editForm[key] = value;
  }

  get canSubmitEditForm(): boolean {
    return (
      !this.isUpdating &&
      this.editingAdminId !== null &&
      this.editForm.firstName.trim().length > 0 &&
      this.editForm.lastName.trim().length > 0 &&
      this.editForm.birthDate.trim().length > 0
    );
  }

  get activeAdmins(): ManagedAdmin[] {
    return this.admins.filter(
      (admin) => admin.status === 'active' && admin.role !== 'super_admin',
    );
  }

  get inactiveAdmins(): ManagedAdmin[] {
    return this.admins.filter(
      (admin) => admin.status === 'inactive' && admin.role !== 'super_admin',
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.activeAdmins.length / SuperAdminAdminsManagementStore.PAGE_SIZE));
  }

  get paginatedActiveAdmins(): ManagedAdmin[] {
    const start = (this.currentPage - 1) * SuperAdminAdminsManagementStore.PAGE_SIZE;
    const end = start + SuperAdminAdminsManagementStore.PAGE_SIZE;
    return this.activeAdmins.slice(start, end);
  }

  get canGoPrevPage(): boolean {
    return this.currentPage > 1;
  }

  get canGoNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPendingAdminDeletion(): boolean {
    return this.pendingAdminDeletion !== null;
  }

  goToPrevPage(): void {
    if (!this.canGoPrevPage) {
      return;
    }

    this.currentPage -= 1;
  }

  goToNextPage(): void {
    if (!this.canGoNextPage) {
      return;
    }

    this.currentPage += 1;
  }

  get canSubmitCreateForm(): boolean {
    return (
      !this.isCreating &&
      this.form.email.trim().length > 0 &&
      this.form.firstName.trim().length > 0 &&
      this.form.lastName.trim().length > 0 &&
      this.form.birthDate.trim().length > 0 &&
      this.form.consent
    );
  }

  setBlockReason(value: string): void {
    this.blockReason = value;
  }

  setBlockedUntil(value: string): void {
    this.blockedUntil = value;
    this.selectedQuickBlockDays = null;
  }

  setPermanentBlock(value: boolean): void {
    this.isPermanentBlock = value;
    this.selectedQuickBlockDays = null;

    if (value) {
      this.blockedUntil = '';
    }
  }

  applyQuickBlockPeriod(days: number): void {
    this.isPermanentBlock = false;
    this.blockedUntil = buildBlockedUntilValue(days);
    this.selectedQuickBlockDays = days;
  }

  openBlockModal(admin: ManagedAdmin): void {
    if (admin.role === 'super_admin') {
      return;
    }

    this.closeEditModal();
    this.selectedAdmin = admin;
    this.blockReason = '';
    this.blockedUntil = '';
    this.isPermanentBlock = false;
    this.selectedQuickBlockDays = null;
    this.changeError = '';
    this.isBlockModalOpen = true;
  }

  closeBlockModal(): void {
    this.isBlockModalOpen = false;
    this.selectedAdmin = null;
    this.blockReason = '';
    this.blockedUntil = '';
    this.isPermanentBlock = false;
    this.selectedQuickBlockDays = null;
  }

  get canSubmitBlock(): boolean {
    return (
      Boolean(this.selectedAdmin) &&
      !this.changingAdminId &&
      this.blockReason.trim().length > 0 &&
      (this.isPermanentBlock || this.blockedUntil.trim().length > 0)
    );
  }

  resetFeedback(): void {
    this.changeError = '';
    this.successMessage = '';
  }

  clearSuccessMessage(): void {
    this.successMessage = '';
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const admins = await superAdminAdminsManagementService.getAdmins();

      runInAction(() => {
        this.admins = admins;
        this.currentPage = 1;
        this.successMessage = '';
      });
    } catch (error) {
      runInAction(() => {
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить список администраторов.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createAdmin(): Promise<void> {
    if (!this.canSubmitCreateForm) {
      return;
    }

    runInAction(() => {
      this.isCreating = true;
      this.createError = '';
      this.createdTemporaryPassword = '';
      this.recentlyCreatedAdminEmail = '';
    });

    try {
      const payload: CreateAdminPayload = {
        email: this.form.email.trim(),
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        middleName: this.form.middleName.trim() || undefined,
        birthDate: this.form.birthDate,
        phone: this.form.phone.trim() || undefined,
        position: this.form.position.trim() || undefined,
        department: this.form.department.trim() || undefined,
        consent: this.form.consent,
      };

      const result = await superAdminAdminsManagementService.createAdmin(payload);

      runInAction(() => {
        this.admins.unshift(result.admin);
        this.currentPage = 1;
        this.createdTemporaryPassword = result.temporaryPassword;
        this.recentlyCreatedAdminEmail = result.admin.email;
        this.form = createInitialForm();
      });
    } catch (error) {
      runInAction(() => {
        this.createError =
          error instanceof Error ? error.message : 'Не удалось создать администратора.';
      });
    } finally {
      runInAction(() => {
        this.isCreating = false;
      });
    }
  }

  async updateAdmin(): Promise<void> {
    if (!this.canSubmitEditForm || !this.editingAdminId) {
      return;
    }

    runInAction(() => {
      this.isUpdating = true;
      this.updateError = '';
    });

    try {
      const payload: UpdateAdminPayload = {
        adminId: this.editingAdminId,
        firstName: this.editForm.firstName.trim(),
        lastName: this.editForm.lastName.trim(),
        middleName: this.editForm.middleName.trim() || undefined,
        birthDate: this.editForm.birthDate,
        phone: this.editForm.phone.trim() || undefined,
        position: this.editForm.position.trim() || undefined,
        department: this.editForm.department.trim() || undefined,
      };

      const updated = await superAdminAdminsManagementService.updateAdmin(payload);

      runInAction(() => {
        this.admins = this.admins.map((admin) =>
          admin.adminId === updated.adminId ? updated : admin,
        );
        this.closeEditModal();
      });
    } catch (error) {
      runInAction(() => {
        this.updateError =
          error instanceof Error ? error.message : 'Не удалось сохранить изменения.';
      });
    } finally {
      runInAction(() => {
        this.isUpdating = false;
      });
    }
  }

  async confirmBlockAdmin(): Promise<void> {
    if (!this.selectedAdmin || !this.canSubmitBlock) {
      return;
    }

    const target = this.selectedAdmin;

    runInAction(() => {
      this.changingAdminId = target.adminId;
      this.changeError = '';
      this.successMessage = '';
    });

    try {
      const updated = await superAdminAdminsManagementService.setAdminBlockStatus({
        adminId: target.adminId,
        isBlocked: true,
        blockReason: this.blockReason.trim(),
        blockedUntil: this.isPermanentBlock ? undefined : this.blockedUntil,
        isPermanentBlock: this.isPermanentBlock,
      });

      runInAction(() => {
        this.admins = this.admins.map((admin) =>
          admin.adminId === updated.adminId ? updated : admin,
        );
        this.successMessage = updated.isPermanentBlock
          ? `Администратор ${updated.email} заблокирован без срока.`
          : `Администратор ${updated.email} заблокирован до ${
              updated.blockedUntil ?? 'указанной даты'
            }.`;
        this.closeBlockModal();
      });
    } catch (error) {
      runInAction(() => {
        this.changeError =
          error instanceof Error
            ? error.message
            : 'Не удалось заблокировать администратора.';
      });
    } finally {
      runInAction(() => {
        this.changingAdminId = null;
      });
    }
  }

  async unblockAdmin(admin: ManagedAdmin): Promise<void> {
    runInAction(() => {
      this.changingAdminId = admin.adminId;
      this.changeError = '';
      this.successMessage = '';
    });

    try {
      const updated = await superAdminAdminsManagementService.setAdminBlockStatus({
        adminId: admin.adminId,
        isBlocked: false,
      });

      runInAction(() => {
        this.admins = this.admins.map((item) =>
          item.adminId === updated.adminId ? updated : item,
        );
        this.successMessage = `Администратор ${updated.email} разблокирован (вход доступен).`;
      });
    } catch (error) {
      runInAction(() => {
        this.changeError =
          error instanceof Error
            ? error.message
            : 'Не удалось разблокировать администратора.';
      });
    } finally {
      runInAction(() => {
        this.changingAdminId = null;
      });
    }
  }

  async clearAdminPasswordLock(admin: ManagedAdmin): Promise<void> {
    runInAction(() => {
      this.changingAdminId = admin.adminId;
      this.changeError = '';
      this.successMessage = '';
    });

    try {
      const updated = await superAdminAdminsManagementService.clearAdminPasswordLock({
        adminId: admin.adminId,
      });

      runInAction(() => {
        this.admins = this.admins.map((item) =>
          item.adminId === updated.adminId ? updated : item,
        );
        this.successMessage = `Временный лок входа для ${updated.email} снят.`;
      });
    } catch (error) {
      runInAction(() => {
        this.changeError =
          error instanceof Error
            ? error.message
            : 'Не удалось снять временный лок входа.';
      });
    } finally {
      runInAction(() => {
        this.changingAdminId = null;
      });
    }
  }

  async deleteAdmin(admin: ManagedAdmin): Promise<void> {
    if (this.pendingAdminDeletion) {
      return;
    }

    const fullName = [admin.lastName, admin.firstName, admin.middleName]
      .filter(Boolean)
      .join(' ');
    const isConfirmed = window.confirm(
      `Вы точно хотите удалить администратора?\n\n${fullName}\n${admin.email}`,
    );

    if (!isConfirmed) {
      return;
    }

    const index = this.admins.findIndex((item) => item.adminId === admin.adminId);
    if (index < 0) {
      return;
    }

    runInAction(() => {
      this.deleteError = '';
      this.successMessage = `Администратор ${admin.email} удалён.`;
      this.admins = this.admins.filter((item) => item.adminId !== admin.adminId);
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    });

    const timeoutId = window.setTimeout(() => {
      void this.commitPendingAdminDeletion();
    }, 6000);

    runInAction(() => {
      this.pendingAdminDeletion = {
        admin,
        index,
        timeoutId,
      };
    });
  }

  undoPendingAdminDeletion(): void {
    if (!this.pendingAdminDeletion) {
      return;
    }

    window.clearTimeout(this.pendingAdminDeletion.timeoutId);

    const nextAdmins = [...this.admins];
    nextAdmins.splice(this.pendingAdminDeletion.index, 0, this.pendingAdminDeletion.admin);
    this.admins = nextAdmins;
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.successMessage = 'Удаление администратора отменено.';
    this.pendingAdminDeletion = null;
  }

  private async commitPendingAdminDeletion(): Promise<void> {
    if (!this.pendingAdminDeletion) {
      return;
    }

    const deletion = this.pendingAdminDeletion;
    this.pendingAdminDeletion = null;

    runInAction(() => {
      this.deletingAdminId = deletion.admin.adminId;
    });

    try {
      await superAdminAdminsManagementService.deleteAdmin({
        adminId: deletion.admin.adminId,
      });
    } catch (error) {
      runInAction(() => {
        const nextAdmins = [...this.admins];
        nextAdmins.splice(deletion.index, 0, deletion.admin);
        this.admins = nextAdmins;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.deleteError =
          error instanceof Error ? error.message : 'Не удалось удалить администратора.';
      });
    } finally {
      runInAction(() => {
        this.deletingAdminId = null;
      });
    }
  }
}

export const superAdminAdminsManagementStore = new SuperAdminAdminsManagementStore();
