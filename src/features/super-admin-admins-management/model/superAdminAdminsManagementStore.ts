// src/features/super-admin-admins-management/model/superAdminAdminsManagementStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { superAdminAdminsManagementService } from '../service/superAdminAdminsManagementService';

import type {
    CreateAdminPayload,
    ManagedAdmin,
} from './types';

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

class SuperAdminAdminsManagementStore {
    admins: ManagedAdmin[] = [];
    isLoading = false;
    loadError = '';

    isCreateModalOpen = false;
    isCreating = false;
    createError = '';
    createdTemporaryPassword = '';
    recentlyCreatedAdminEmail = '';

    deletingAdminId: string | null = null;
    deleteError = '';

    form: CreateAdminForm = createInitialForm();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    openCreateModal(): void {
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

    setFormField<K extends keyof CreateAdminForm>(
        key: K,
        value: CreateAdminForm[K],
    ): void {
        this.form[key] = value;
    }

    get activeAdmins(): ManagedAdmin[] {
        return this.admins.filter((admin) => admin.status === 'active');
    }

    get inactiveAdmins(): ManagedAdmin[] {
        return this.admins.filter((admin) => admin.status === 'inactive');
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

    async load(): Promise<void> {
        runInAction(() => {
            this.isLoading = true;
            this.loadError = '';
        });

        try {
            const admins =
                await superAdminAdminsManagementService.getAdmins();

            runInAction(() => {
                this.admins = admins;
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

            const result =
                await superAdminAdminsManagementService.createAdmin(payload);

            runInAction(() => {
                this.admins.unshift(result.admin);
                this.createdTemporaryPassword = result.temporaryPassword;
                this.recentlyCreatedAdminEmail = result.admin.email;
                this.form = createInitialForm();
            });
        } catch (error) {
            runInAction(() => {
                this.createError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось создать администратора.';
            });
        } finally {
            runInAction(() => {
                this.isCreating = false;
            });
        }
    }

    async deleteAdmin(adminId: string): Promise<void> {
        runInAction(() => {
            this.deletingAdminId = adminId;
            this.deleteError = '';
        });

        try {
            await superAdminAdminsManagementService.deleteAdmin({
                adminId,
            });

            runInAction(() => {
                this.admins = this.admins.filter(
                    (admin) => admin.adminId !== adminId,
                );
            });
        } catch (error) {
            runInAction(() => {
                this.deleteError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось удалить администратора.';
            });
        } finally {
            runInAction(() => {
                this.deletingAdminId = null;
            });
        }
    }
}

export const superAdminAdminsManagementStore =
    new SuperAdminAdminsManagementStore();
