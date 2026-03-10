// src/features/specialist-profile/model/specialistProfileStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { SPECIALIST_ADVANTAGE_OPTIONS } from './constants';
import { specialistProfileService } from '../service/specialistProfileService';
import type {
    SpecialistChildrenPolicy,
    SpecialistDetails,
    SpecialistDetailsUpdatePayload,
    SpecialistExperienceUnit,
    SpecialistGalleryItem,
    SpecialistHousingType,
    SpecialistMainInfo,
    SpecialistMainInfoUpdatePayload,
    SpecialistPetAge,
    SpecialistPetSize,
    SpecialistPetType,
    SpecialistProfile,
    SpecialistReview,
    SpecialistService,
    SpecialistServicePriceUnit,
} from './types';

const INITIAL_VISIBLE_REVIEWS_COUNT = 3;
const REVIEWS_LOAD_STEP = 3;
const MAX_SERVICE_PRICE = 1_000_000;
const MAX_ADVANTAGES_COUNT = 3;

const PET_SIZE_OPTIONS: SpecialistPetSize[] = ['small', 'medium', 'large', 'giant'];
const PET_AGE_OPTIONS: SpecialistPetAge[] = ['baby', 'young', 'adult', 'senior'];

type MainForm = {
    avatarUrl: string;
    firstName: string;
    lastName: string;
    city: string;
    district: string;
    phone: string;
};

type EditableGalleryItem = {
    id: string;
    imageUrl: string;
    alt: string;
};

type EditableServiceFormItem = {
    id: string;
    name: string;
    locationLabel: string;
    price: string;
    priceUnit: SpecialistServicePriceUnit;
};

type DetailsForm = {
    experienceDurationValue: string;
    experienceDurationUnit: SpecialistExperienceUnit;
    housingType: SpecialistHousingType;
    petSizes: SpecialistPetSize[];
    petAges: SpecialistPetAge[];
    hasChildrenUnderTen: SpecialistChildrenPolicy;
    petTypes: SpecialistPetType[];
    selectedAdvantages: string[];
    about: string;
    services: EditableServiceFormItem[];
    specialistGallery: EditableGalleryItem[];
    specialistGalleryUrlInput: string;
};

type MainFormErrors = Partial<Record<keyof MainForm, string>>;
type DetailsFormErrors = Partial<
    Record<
        | 'experienceDurationValue'
        | 'housingType'
        | 'petSizes'
        | 'petAges'
        | 'hasChildrenUnderTen'
        | 'petTypes'
        | 'about'
        | 'services'
        | 'specialistGallery'
        | 'selectedAdvantages',
        string
    >
>;

function createMainForm(main: SpecialistMainInfo): MainForm {
    return {
        avatarUrl: main.avatarUrl ?? '',
        firstName: main.firstName,
        lastName: main.lastName,
        city: main.city,
        district: main.district,
        phone: main.phone,
    };
}

function mapServiceToForm(service: SpecialistService): EditableServiceFormItem {
    return {
        id: service.id,
        name: service.name,
        locationLabel: service.locationLabel,
        price: String(service.price),
        priceUnit: service.priceUnit,
    };
}

function mapGalleryToFormItem(item: SpecialistGalleryItem): EditableGalleryItem {
    return {
        id: item.id,
        imageUrl: item.imageUrl,
        alt: item.alt,
    };
}

function parseExperience(details: SpecialistDetails): {
    value: string;
    unit: SpecialistExperienceUnit;
} {
    if (
        typeof details.experienceDurationValue === 'number' &&
        details.experienceDurationValue > 0 &&
        details.experienceDurationUnit
    ) {
        return {
            value: String(details.experienceDurationValue),
            unit: details.experienceDurationUnit,
        };
    }

    const normalized = details.experienceLabel.trim().toLowerCase();
    const match = normalized.match(/(\d+)/);

    if (!match) {
        return { value: '', unit: 'years' };
    }

    return {
        value: match[1],
        unit: normalized.includes('месяц') ? 'months' : 'years',
    };
}

function createDetailsForm(
    details: SpecialistDetails,
    services: SpecialistService[],
    specialistGallery: SpecialistGalleryItem[],
): DetailsForm {
    const parsedExperience = parseExperience(details);
    return {
        experienceDurationValue: parsedExperience.value,
        experienceDurationUnit: parsedExperience.unit,
        housingType: details.housingType,
        petSizes: [...details.petSizes],
        petAges: [...details.petAges],
        hasChildrenUnderTen: details.hasChildrenUnderTen,
        petTypes: [...details.petTypes],
        selectedAdvantages: details.advantages
            .map((item) => item.title)
            .filter((item): item is string =>
                (SPECIALIST_ADVANTAGE_OPTIONS as readonly string[]).includes(item),
            )
            .slice(0, MAX_ADVANTAGES_COUNT),
        about: details.about,
        services: services.map(mapServiceToForm),
        specialistGallery: specialistGallery.map(mapGalleryToFormItem),
        specialistGalleryUrlInput: '',
    };
}

function isValidPhone(value: string): boolean {
    const normalized = value.replace(/[^\d+]/g, '');
    return normalized.length >= 11;
}

function createLocalId(prefix: string): string {
    return `${prefix} -${Date.now()} -${Math.random().toString(36).slice(2, 10)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('Не удалось прочитать файл.'));
        };

        reader.onerror = () => {
            reject(new Error('Не удалось прочитать файл.'));
        };

        reader.readAsDataURL(file);
    });
}

function createGalleryAlt(index: number): string {
    return `Фото специалиста ${index}`;
}

function createExperienceLabel(value: string, unit: SpecialistExperienceUnit): string {
    const normalizedValue = value.trim();
    const safeValue = normalizedValue === '' ? '0' : normalizedValue;
    return `${safeValue} ${unit === 'years' ? 'лет' : 'месяцев'}`;
}

function clampPriceString(value: string): string {
    if (value.trim() === '') {
        return '';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue) || numericValue < 0) {
        return '0';
    }

    return String(Math.min(Math.floor(numericValue), MAX_SERVICE_PRICE));
}

export class SpecialistProfileStore {
    profile: SpecialistProfile | null = null;
    isLoading = false;
    error: string | null = null;
    visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;
    loadedSlug: string | null = null;

    isEditingMain = false;
    isSavingMain = false;
    mainSaveError: string | null = null;
    mainForm: MainForm | null = null;
    mainFormErrors: MainFormErrors = {};

    isEditingDetails = false;
    isSavingDetails = false;
    detailsSaveError: string | null = null;
    detailsForm: DetailsForm | null = null;
    detailsFormErrors: DetailsFormErrors = {};

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get visibleReviews(): SpecialistReview[] {
        if (!this.profile) {
            return [];
        }

        return this.profile.reviews.slice(0, this.visibleReviewsCount);
    }

    get canLoadMoreReviews(): boolean {
        if (!this.profile) {
            return false;
        }

        return this.visibleReviewsCount < this.profile.reviews.length;
    }

    async load(slug: string): Promise<void> {
        if (!slug.trim()) {
            runInAction(() => {
                this.error = 'Некорректная ссылка на профиль специалиста.';
                this.profile = null;
                this.isLoading = false;
            });

            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const profile = await specialistProfileService.getBySlug(slug);

            runInAction(() => {
                this.profile = profile;
                this.loadedSlug = slug;
                this.visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;

                this.isEditingMain = false;
                this.isSavingMain = false;
                this.mainSaveError = null;
                this.mainForm = null;
                this.mainFormErrors = {};

                this.isEditingDetails = false;
                this.isSavingDetails = false;
                this.detailsSaveError = null;
                this.detailsForm = null;
                this.detailsFormErrors = {};
            });
        } catch (error) {
            runInAction(() => {
                this.profile = null;
                this.error
                    =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить профиль специалиста.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    loadMoreReviews(): void {
        if (!this.profile) {
            return;
        }

        this.visibleReviewsCount = Math.min(
            this.visibleReviewsCount + REVIEWS_LOAD_STEP,
            this.profile.reviews.length,
        );
    }

    startMainEditing(): void {
        if (!this.profile?.isOwner) {
            return;
        }

        this.mainForm = createMainForm(this.profile.main);
        this.mainFormErrors = {};
        this.mainSaveError = null;
        this.isEditingMain = true;
    }

    cancelMainEditing(): void {
        this.isEditingMain = false;
        this.mainForm = null;
        this.mainFormErrors = {};
        this.mainSaveError = null;
    }

    setMainField(field: keyof MainForm, value: string): void {
        if (!this.mainForm) {
            return;
        }

        this.mainForm[field] = value;
        delete this.mainFormErrors[field];
    }

    async setMainAvatarFile(file: File | null): Promise<void> {
        if (!this.mainForm || !file) {
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);

            runInAction(() => {
                if (!this.mainForm) {
                    return;
                }

                this.mainForm.avatarUrl = dataUrl;
            });
        } catch (error) {
            runInAction(() => {
                this.mainSaveError =
                    error instanceof Error ? error.message : 'Не удалось загрузить изображение.';
            });
        }
    }

    private validateMainForm(): boolean {
        if (!this.mainForm) {
            return false;
        }

        const errors: MainFormErrors = {};

        if (!this.mainForm.firstName.trim()) {
            errors.firstName = 'Укажи имя.';
        }

        if (!this.mainForm.lastName.trim()) {
            errors.lastName = 'Укажи фамилию.';
        }

        if (!this.mainForm.city.trim()) {
            errors.city = 'Укажи город.';
        }

        if (!this.mainForm.district.trim()) {
            errors.district = 'Укажи район.';
        }

        if (!isValidPhone(this.mainForm.phone)) {
            errors.phone = 'Укажи корректный телефон.';
        }

        this.mainFormErrors = errors;

        return Object.keys(errors).length === 0;
    }

    async saveMain(): Promise<void> {
        if (!this.profile || !this.profile.isOwner || !this.mainForm) {
            return;
        }

        if (!this.validateMainForm()) {
            return;
        }

        this.isSavingMain = true;
        this.mainSaveError = null;

        const payload: SpecialistMainInfoUpdatePayload = {
            avatarUrl: this.mainForm.avatarUrl.trim() || undefined,
            firstName: this.mainForm.firstName.trim(),
            lastName: this.mainForm.lastName.trim(),
            city: this.mainForm.city.trim(),
            district: this.mainForm.district.trim(),
            phone: this.mainForm.phone.trim(),
        };

        try {
            const updatedProfile = await specialistProfileService.updateMainInfo(
                this.profile.slug,
                payload,
            );

            runInAction(() => {
                this.profile = updatedProfile;
                this.isEditingMain = false;
                this.mainForm = null;
                this.mainFormErrors = {};
            });
        } catch (error) {
            runInAction(() => {
                this.mainSaveError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить основные данные.';
            });
        } finally {
            runInAction(() => {
                this.isSavingMain = false;
            });
        }
    }

    startDetailsEditing(): void {
        if (!this.profile?.isOwner) {
            return;
        }

        this.detailsForm = createDetailsForm(
            this.profile.details,
            this.profile.services,
            this.profile.specialistGallery ?? [],
        );
        this.detailsFormErrors = {};
        this.detailsSaveError = null;
        this.isEditingDetails = true;
    }

    cancelDetailsEditing(): void {
        this.isEditingDetails = false;
        this.detailsForm = null;
        this.detailsFormErrors = {};
        this.detailsSaveError = null;
    }
    setDetailsField<
        K extends keyof Omit<DetailsForm, 'services' | 'specialistGallery' | 'selectedAdvantages'>
    >(field: K, value: DetailsForm[K]): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm[field] = value;
        delete this.detailsFormErrors[field as keyof DetailsFormErrors];
    }

    togglePetSize(value: SpecialistPetSize): void {
        if (!this.detailsForm) {
            return;
        }

        const hasValue = this.detailsForm.petSizes.includes(value);

        this.detailsForm.petSizes = hasValue
            ? this.detailsForm.petSizes.filter((item) => item !== value)
            : [...this.detailsForm.petSizes, value];

        delete this.detailsFormErrors.petSizes;
    }

    toggleAllPetSizes(): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.petSizes =
            this.detailsForm.petSizes.length === PET_SIZE_OPTIONS.length ? [] : [...PET_SIZE_OPTIONS];

        delete this.detailsFormErrors.petSizes;
    }

    togglePetAge(value: SpecialistPetAge): void {
        if (!this.detailsForm) {
            return;
        }

        const hasValue = this.detailsForm.petAges.includes(value);

        this.detailsForm.petAges = hasValue
            ? this.detailsForm.petAges.filter((item) => item !== value)
            : [...this.detailsForm.petAges, value];

        delete this.detailsFormErrors.petAges;
    }

    toggleAllPetAges(): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.petAges =
            this.detailsForm.petAges.length === PET_AGE_OPTIONS.length ? [] : [...PET_AGE_OPTIONS];

        delete this.detailsFormErrors.petAges;
    }

    togglePetType(value: SpecialistPetType): void {
        if (!this.detailsForm) {
            return;
        }

        const hasValue = this.detailsForm.petTypes.includes(value);

        this.detailsForm.petTypes = hasValue
            ? this.detailsForm.petTypes.filter((item) => item !== value)
            : [...this.detailsForm.petTypes, value];

        delete this.detailsFormErrors.petTypes;
    }

    toggleAdvantage(value: string): void {
        if (!this.detailsForm) {
            return;
        }

        const hasValue = this.detailsForm.selectedAdvantages.includes(value);

        if (hasValue) {
            this.detailsForm.selectedAdvantages = this.detailsForm.selectedAdvantages.filter(
                (item) => item !== value,
            );
            delete this.detailsFormErrors.selectedAdvantages;
            return;
        }

        if (this.detailsForm.selectedAdvantages.length >= MAX_ADVANTAGES_COUNT) {
            this.detailsFormErrors.selectedAdvantages = 'Можно выбрать не больше трёх преимуществ.';
            return;
        }

        this.detailsForm.selectedAdvantages = [...this.detailsForm.selectedAdvantages, value];
        delete this.detailsFormErrors.selectedAdvantages;
    }
    addService(): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.services.push({
            id: createLocalId('service'),
            name: '',
            locationLabel: '',
            price: '0',
            priceUnit: 'service',
        });

        delete this.detailsFormErrors.services;
    }

    removeService(index: number): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.services = this.detailsForm.services.filter(
            (_, itemIndex) => itemIndex !== index,
        );

        delete this.detailsFormErrors.services;
    }

    setServiceField(
        index: number,
        field: keyof EditableServiceFormItem,
        value: string,
    ): void {
        if (!this.detailsForm) {
            return;
        }

        const service = this.detailsForm.services[index];

        if (!service) {
            return;
        }

        if (field === 'priceUnit') {
            service.priceUnit = value as SpecialistServicePriceUnit;
        } else if (field === 'price') {
            service.price = clampPriceString(value);
        } else {
            service[field] = value;
        }

        delete this.detailsFormErrors.services;
    }

    setSpecialistGalleryUrlInput(value: string): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.specialistGalleryUrlInput = value;
        delete this.detailsFormErrors.specialistGallery;
    }

    addSpecialistGalleryImageByUrl(): void {
        if (!this.detailsForm) {
            return;
        }

        const imageUrl = this.detailsForm.specialistGalleryUrlInput.trim();

        if (!imageUrl) {
            this.detailsFormErrors.specialistGallery = 'Вставь ссылку на изображение.';
            return;
        }

        this.detailsForm.specialistGallery.push({
            id: createLocalId('specialist-photo'),
            imageUrl,
            alt: createGalleryAlt(this.detailsForm.specialistGallery.length + 1),
        });
        this.detailsForm.specialistGalleryUrlInput = '';
        delete this.detailsFormErrors.specialistGallery;
    }

    async addSpecialistGalleryFiles(files: FileList | null): Promise<void> {
        if (!this.detailsForm || !files || files.length === 0) {
            return;
        }

        try {
            const baseIndex = this.detailsForm.specialistGallery.length;

            const uploadedItems = await Promise.all(
                Array.from(files).map(async (file, index) => ({
                    id: createLocalId('specialist-photo'),
                    imageUrl: await readFileAsDataUrl(file),
                    alt: createGalleryAlt(baseIndex + index + 1),
                })),
            );

            runInAction(() => {
                if (!this.detailsForm) {
                    return;
                }

                this.detailsForm.specialistGallery = [
                    ...this.detailsForm.specialistGallery,
                    ...uploadedItems,
                ];
                delete this.detailsFormErrors.specialistGallery;
            });
        } catch (error) {
            runInAction(() => {
                this.detailsSaveError =
                    error instanceof Error ? error.message : 'Не удалось загрузить фотографии.';
            });
        }
    }

    removeSpecialistGalleryImage(index: number): void {
        if (!this.detailsForm) {
            return;
        }

        this.detailsForm.specialistGallery = this.detailsForm.specialistGallery.filter(
            (_, itemIndex) => itemIndex !== index,
        );

        delete this.detailsFormErrors.specialistGallery;
    }

    private validateDetailsForm(): boolean {
        if (!this.detailsForm) {
            return false;
        }

        const errors: DetailsFormErrors = {};

        if (!this.detailsForm.experienceDurationValue.trim()) {
            errors.experienceDurationValue = 'Укажи опыт ухода за животными.';
        } else {
            const numericValue = Number(this.detailsForm.experienceDurationValue);

            if (!Number.isFinite(numericValue) || numericValue <= 0) {
                errors.experienceDurationValue = 'Укажи корректное число.';
            }
        }

        if (this.detailsForm.petSizes.length === 0) {
            errors.petSizes = 'Выбери хотя бы один размер питомцев.';
        }

        if (this.detailsForm.petAges.length === 0) {
            errors.petAges = 'Выбери хотя бы один возраст питомцев.';
        }

        if (this.detailsForm.petTypes.length === 0) {
            errors.petTypes = 'Выбери хотя бы один тип питомцев.';
        }

        if (this.detailsForm.selectedAdvantages.
            length > MAX_ADVANTAGES_COUNT) {
            errors.selectedAdvantages = 'Можно выбрать не больше трёх преимуществ.';
        }

        if (!this.detailsForm.about.trim()) {
            errors.about = 'Заполни блок «Обо мне».';
        }

        const hasInvalidServices =
            this.detailsForm.services.length === 0
        this.detailsForm.services.some((service) => {
            const price = Number(service.price);

            return (
                !service.name.trim() ||
                !service.locationLabel.trim() ||
                Number.isNaN(price) ||
                price < 0 ||
                price > MAX_SERVICE_PRICE
            );
        });

        if (hasInvalidServices) {
            errors.services =
                'Заполни услуги корректно: название, место проведения и цена от 0 до 1 000 000 ₽.';
        }

        const hasInvalidGallery = this.detailsForm.specialistGallery.some(
            (item) => !item.imageUrl.trim(),
        );

        if (hasInvalidGallery) {
            errors.specialistGallery = 'У фотографий должен быть корректный источник.';
        }

        this.detailsFormErrors = errors;

        return Object.keys(errors).length === 0;
    }

    async saveDetails(): Promise<void> {
        if (!this.profile || !this.profile.isOwner || !this.detailsForm) {
            return;
        }

        if (!this.validateDetailsForm()) {
            return;
        }

        this.isSavingDetails = true;
        this.detailsSaveError = null;

        const payload: SpecialistDetailsUpdatePayload = {
            experienceLabel: createExperienceLabel(
                this.detailsForm.experienceDurationValue,
                this.detailsForm.experienceDurationUnit,
            ),
            experienceDurationValue: Number(this.detailsForm.experienceDurationValue),
            experienceDurationUnit: this.detailsForm.experienceDurationUnit,
            housingType: this.detailsForm.housingType,
            petSizes: [...this.detailsForm.petSizes],
            petAges: [...this.detailsForm.petAges],
            hasChildrenUnderTen: this.detailsForm.hasChildrenUnderTen,
            petTypes: [...this.detailsForm.petTypes],
            advantages: [...this.detailsForm.selectedAdvantages],
            about: this.detailsForm.about.trim(),
            services: this.detailsForm.services.map((service) => ({
                id: service.id,
                name: service.name.trim(),
                locationLabel: service.locationLabel.trim(),
                price: Number(service.price),
                priceUnit: service.priceUnit,
            })),
            specialistGallery: this.detailsForm.specialistGallery.map((item, index) => ({
                id: item.id,
                imageUrl: item.imageUrl.trim(),
                alt: item.alt.trim() || createGalleryAlt(index + 1),
            })),
        };

        try {
            const updatedProfile = await specialistProfileService.updateDetails(
                this.profile.slug,
                payload,
            );

            runInAction(() => {
                this.profile = updatedProfile;
                this.isEditingDetails = false;
                this.detailsForm = null;
                this.detailsFormErrors = {};
            });
        } catch (error) {
            runInAction(() => {
                this.detailsSaveError =
                    error instanceof Error ? error.message : 'Не удалось сохранить детали.';
            });
        } finally {
            runInAction(() => {
                this.isSavingDetails = false;
            });
        }
    }

    reset(): void {
        this.profile = null;
        this.isLoading = false;
        this.error = null;
        this.visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;
        this.loadedSlug = null;

        this.isEditingMain = false;
        this.isSavingMain = false;
        this.mainSaveError = null;
        this.mainForm = null;
        this.mainFormErrors = {};

        this.isEditingDetails = false;
        this.isSavingDetails = false;
        this.detailsSaveError = null;
        this.detailsForm = null;
        this.detailsFormErrors = {};
    }
}

export const specialistProfileStore = new SpecialistProfileStore();