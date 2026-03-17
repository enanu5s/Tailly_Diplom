// src/features/specialist-profile/ui/SpecialistProfileView.tsx

import { observer } from 'mobx-react-lite';

import { SpecialistMiniCalendar } from './SpecialistMiniCalendar';
import { SpecialistPhotoGallery } from './SpecialistPhotoGallery';
import styles from './SpecialistProfileView.module.css';
import {
    SPECIALIST_ADVANTAGE_OPTIONS,
    SPECIALIST_CHILDREN_POLICY_LABELS,
    SPECIALIST_EXPERIENCE_UNIT_LABELS,
    SPECIALIST_HOUSING_TYPE_LABELS,
    SPECIALIST_PET_AGE_LABELS,
    SPECIALIST_PET_SIZE_LABELS,
    SPECIALIST_PET_TYPE_LABELS,
    SPECIALIST_SERVICE_PRICE_UNIT_LABELS,
} from '../model/constants';

import type {
    SpecialistChildrenPolicy,
    SpecialistExperienceUnit,
    SpecialistHousingType,
    SpecialistPetAge,
    SpecialistPetSize,
    SpecialistPetType,
    SpecialistProfile,
    SpecialistReview,
    SpecialistServicePriceUnit,
} from '../model/types';


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

type Props = {
    profile: SpecialistProfile | null;
    isLoading: boolean;
    error: string | null;
    visibleReviews: SpecialistReview[];
    canLoadMoreReviews: boolean;
    onRetry: () => void;
    onLoadMoreReviews: () => void;

    isEditingMain: boolean;
    isSavingMain: boolean;
    mainSaveError: string | null;
    mainForm: MainForm | null;
    mainFormErrors: Partial<Record<keyof MainForm, string>>;
    onStartMainEditing: () => void;
    onCancelMainEditing: () => void;
    onSetMainField: (field: keyof MainForm, value: string) => void;
    onSetMainAvatarFile: (file: File | null) => Promise<void> | void;
    onSaveMain: () => void;

    isEditingDetails: boolean;
    isSavingDetails: boolean;
    detailsSaveError: string | null;
    detailsForm: DetailsForm | null;
    detailsFormErrors: Partial<
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
    onStartDetailsEditing: () => void;
    onCancelDetailsEditing: () => void;
    onSetDetailsField: <
        K extends keyof Omit<DetailsForm, 'services' | 'specialistGallery' | 'selectedAdvantages'>
    >(
        field: K,
        value: DetailsForm[K],
    ) => void;
    onTogglePetSize: (value: SpecialistPetSize) => void;
    onToggleAllPetSizes: () => void;
    onTogglePetAge: (value: SpecialistPetAge) => void;
    onToggleAllPetAges: () => void;
    onTogglePetType: (value: SpecialistPetType) => void;
    onToggleAdvantage: (value: string) => void;
    onAddService: () => void;
    onRemoveService: (index: number) => void;
    onSetServiceField: (
        index: number,
        field: keyof EditableServiceFormItem,
        value: string,
    ) => void;
    onSetSpecialistGalleryUrlInput: (value: string) => void;
    onAddSpecialistGalleryImageByUrl: () => void;
    onAddSpecialistGalleryFiles: (files: FileList | null) => Promise<void> | void;
    onRemoveSpecialistGalleryImage: (index: number) => void;
    onSaveDetails: () => void;
};

const PET_SIZE_OPTIONS: SpecialistPetSize[] = ['small', 'medium', 'large', 'giant'];
const PET_AGE_OPTIONS: SpecialistPetAge[] = ['baby', 'young', 'adult', 'senior'];
const PET_TYPE_OPTIONS: SpecialistPetType[] = [
    'cat',
    'dog',
    'rodent',
    'rabbit',
    'bird',
    'fish',
    'reptile',
    'other',
];
const HOUSING_OPTIONS: SpecialistHousingType[] = [
    'apartment',
    'house',
    'townhouse',
    'other',
];
const CHILDREN_OPTIONS: SpecialistChildrenPolicy[] = ['yes', 'no', 'sometimes'];
const SERVICE_PRICE_UNIT_OPTIONS: SpecialistServicePriceUnit[] = [
    'hour',
    'day',
    'service',
    'walk',
    'visit',
];
const MAX_SERVICE_PRICE = 1_000_000;

function formatPhone(phone: string): string {
    return phone.trim();
}

function formatDate(date: string): string {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parsedDate);
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function getRatingStars(rating: number): string {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

export const SpecialistProfileView = observer(({
    profile,
    isLoading,
    error,
    visibleReviews,
    canLoadMoreReviews,
    onRetry,
    onLoadMoreReviews,

    isEditingMain,
    isSavingMain,
    mainSaveError,
    mainForm,
    mainFormErrors,
    onStartMainEditing,
    onCancelMainEditing,
    onSetMainField,
    onSetMainAvatarFile,
    onSaveMain,

    isEditingDetails,
    isSavingDetails,
    detailsSaveError,
    detailsForm,
    detailsFormErrors,
    onStartDetailsEditing,
    onCancelDetailsEditing,
    onSetDetailsField,
    onTogglePetSize,
    onToggleAllPetSizes,
    onTogglePetAge,
    onToggleAllPetAges,
    onTogglePetType,
    onToggleAdvantage,
    onAddService,
    onRemoveService,
    onSetServiceField,
    onSetSpecialistGalleryUrlInput,
    onAddSpecialistGalleryImageByUrl,
    onAddSpecialistGalleryFiles,
    onRemoveSpecialistGalleryImage,
    onSaveDetails,
}: Props) => {

    if (isLoading) {
        return (
            <div className={styles.stateCard}>
                <h2 className={styles.stateTitle}>Загрузка профиля специалиста</h2>
                <p className={styles.stateText}>Подготавливаем данные профиля, календаря и отзывов.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.stateCard}>
                <h2 className={styles.stateTitle}>Не удалось открыть профиль</h2>
                <p className={styles.stateText}>{error}</p>

                <button type="button" className={styles.primaryButton} onClick={onRetry}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.stateCard}>
                <h2 className={styles.stateTitle}>Профиль не найден</h2>
                <p className={styles.stateText}>Специалист с такой ссылкой отсутствует или был удалён.</p>
            </div>
        );
    }

    const currentMain = isEditingMain && mainForm ? mainForm : profile.main;
    const currentDetails = isEditingDetails && detailsForm ? detailsForm : null;
    const currentSpecialistGallery = currentDetails
        ? currentDetails.specialistGallery
        : (profile.specialistGallery ?? []);

    const currentName = `${currentMain.firstName} ${currentMain.lastName}`.trim();
    const currentAvatarUrl = currentMain.avatarUrl?.trim() ?? '';
    const currentCity = currentMain.city.trim();
    const currentDistrict = currentMain.district.trim();
    const currentPhone = currentMain.phone.trim();
    const currentEmail = profile.main.email.trim();

    const currentExperienceValue = currentDetails
        ? currentDetails.experienceDurationValue
        : String(profile.details.experienceDurationValue ?? '');

    const currentExperienceUnit = currentDetails
        ? currentDetails.experienceDurationUnit
        : (profile.details.experienceDurationUnit ?? 'years');

    const currentExperienceLabel =
        currentExperienceValue.trim() !== ''
            ? `${currentExperienceValue} ${SPECIALIST_EXPERIENCE_UNIT_LABELS[currentExperienceUnit]}`
            : profile.details.experienceLabel;

    const currentHousingType = currentDetails
        ? currentDetails.housingType
        : profile.details.housingType;

    const currentPetSizes = currentDetails ? currentDetails.petSizes : profile.details.petSizes;
    const currentPetAges = currentDetails ? currentDetails.petAges : profile.details.petAges;
    const currentChildrenPolicy = currentDetails
        ? currentDetails.hasChildrenUnderTen
        : profile.details.hasChildrenUnderTen;
    const currentPetTypes = currentDetails ? currentDetails.petTypes : profile.details.petTypes;
    const currentAdvantages = currentDetails
        ? currentDetails.selectedAdvantages
        : profile.details.advantages.map((advantage) => advantage.title);

    const currentServices = currentDetails
        ? currentDetails.services.map((service) => ({
            id: service.id,
            name: service.name.trim(),
            locationLabel: service.locationLabel.trim(),
            price: Number(service.price),
            priceUnit: service.priceUnit,
        }))
        : profile.services;

    const currentAbout = currentDetails ? currentDetails.about : profile.details.about;

    const isAllPetSizesSelected = currentDetails
        ? currentDetails.petSizes.length === PET_SIZE_OPTIONS.length
        : currentPetSizes.length === PET_SIZE_OPTIONS.length;

    const isAllPetAgesSelected = currentDetails
        ? currentDetails.petAges.length === PET_AGE_OPTIONS.length
        : currentPetAges.length === PET_AGE_OPTIONS.length;

    return (
        <div className={styles.layout}>
            <div className={styles.leftColumn}>
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Основные данные</h2>
                        {profile.isOwner ? (
                            isEditingMain ? (
                                <div className={styles.actionsRow}>
                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={onCancelMainEditing}
                                        disabled={isSavingMain}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={onSaveMain}
                                        disabled={isSavingMain}
                                    >
                                        {isSavingMain ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={onStartMainEditing}
                                >
                                    Редактировать
                                </button>
                            )
                        ) : null}
                    </div>

                    {mainSaveError ? <div className={styles.formError}>{mainSaveError}</div> : null}

                    <div className={styles.mainInfo}>
                        <div className={styles.avatarWrap}>
                            {currentAvatarUrl ? (
                                <img
                                    className={styles.avatar}
                                    src={currentAvatarUrl}
                                    alt={currentName || 'Специалист'}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {(currentMain.firstName || '').charAt(0)}
                                    {(currentMain.lastName || '').charAt(0)}
                                </div>
                            )}

                            {isEditingMain ? (
                                <div className={styles.inlineAvatarEditor}>
                                    <input
                                        className={styles.input}
                                        value={mainForm?.avatarUrl ?? ''}
                                        onChange={(event) => onSetMainField('avatarUrl', event.target.value)}
                                        placeholder="Ссылка на фото"
                                    />
                                    <label className={styles.uploadButton}>
                                        <span>Загрузить с компьютера</span>
                                        <input
                                            className={styles.hiddenFileInput}
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                void onSetMainAvatarFile(file);
                                                event.currentTarget.value = '';
                                            }}
                                        />
                                    </label>
                                </div>
                            ) : null}
                        </div>

                        <div className={styles.mainInfoBody}>
                            {isEditingMain ? (
                                <div className={styles.inlineNameFields}>
                                    <div className={styles.inlineFieldBlock}>
                                        <input
                                            className={styles.inlineTitleInput}
                                            value={mainForm?.firstName ?? ''}
                                            onChange={(event) => onSetMainField('firstName', event.target.value)}
                                            placeholder="Имя"
                                        />
                                        {mainFormErrors.firstName ? (
                                            <span className={styles.fieldError}>{mainFormErrors.firstName}</span>
                                        ) : null}
                                    </div>

                                    <div className={styles.inlineFieldBlock}>
                                        <input
                                            className={styles.inlineTitleInput}
                                            value={mainForm?.lastName ?? ''}
                                            onChange={(event) => onSetMainField('lastName', event.target.value)}
                                            placeholder="Фамилия"
                                        />
                                        {mainFormErrors.lastName ? (
                                            <span className={styles.fieldError}>{mainFormErrors.lastName}</span>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <h1 className={styles.specialistName}>{currentName || 'Без имени'}</h1>
                            )}
                            <ul className={styles.metaList}>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Город</span>
                                    {isEditingMain ? (
                                        <div className={styles.inlineFieldBlock}>
                                            <input
                                                className={styles.inlineValueInput}
                                                value={mainForm?.city ?? ''}
                                                onChange={(event) => onSetMainField('city', event.target.value)}
                                                placeholder="Город"
                                            />
                                            {mainFormErrors.city ? (
                                                <span className={styles.fieldError}>{mainFormErrors.city}</span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <span className={styles.metaValue}>{currentCity || '—'}</span>
                                    )}
                                </li>

                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Район</span>
                                    {isEditingMain ? (
                                        <div className={styles.inlineFieldBlock}>
                                            <input
                                                className={styles.inlineValueInput}
                                                value={mainForm?.district ?? ''}
                                                onChange={(event) => onSetMainField('district', event.target.value)}
                                                placeholder="Район"
                                            />
                                            {mainFormErrors.district ? (
                                                <span className={styles.fieldError}>{mainFormErrors.district}</span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <span className={styles.metaValue}>{currentDistrict || '—'}</span>
                                    )}
                                </li>

                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Телефон</span>
                                    {isEditingMain ? (
                                        <div className={styles.inlineFieldBlock}>
                                            <input
                                                className={styles.inlineValueInput}
                                                value={mainForm?.phone ?? ''}
                                                onChange={(event) => onSetMainField('phone', event.target.value)}
                                                placeholder="Телефон"
                                            />
                                            {mainFormErrors.phone ? (
                                                <span className={styles.fieldError}>{mainFormErrors.phone}</span>
                                            ) : null}
                                        </div>
                                    ) : currentPhone ? (
                                        <a className={styles.metaValueLink} href={`tel:${currentPhone}`}>
                                            {formatPhone(currentPhone)}
                                        </a>
                                    ) : (
                                        <span className={styles.metaValue}>—</span>
                                    )}
                                </li>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Email</span>
                                    <span className={styles.metaValue}>{currentEmail || '—'}</span>
                                </li>

                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Доступ</span>
                                    <span className={styles.metaValue}>
                                        Email и пароль можно изменить только через настройки профиля клиента
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className={styles.card}>

                    <div className={styles.calendarSection}>
                        <SpecialistMiniCalendar
                            calendar={profile.calendar}
                            editHref={
                                profile.isOwner
                                    ? `/specialists/${profile.slug.trim()}/calendar/edit`
                                    : undefined
                            }
                        />

                    </div>

                    <div className={styles.badgesColumn}>
                        <div className={styles.infoBadge}>
                            <span className={styles.infoBadgeLabel}>Опыт ухода за животными</span>
                            <span className={styles.infoBadgeValue}>{profile.stats.experienceYears} лет</span>
                        </div>

                        <div className={styles.ratingCard}>
                            <div className={styles.ratingTop}>
                                <div>
                                    <div className={styles.ratingValue}>{profile.stats.rating.toFixed(2)}</div>
                                    <div className={styles.ratingStars}>{getRatingStars(profile.stats.rating)}</div>
                                </div>

                                <a className={styles.primaryLinkButton} href="#specialist-reviews">
                                    Перейти в отзывы
                                </a>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{profile.stats.reviewsCount}</span>
                                    <span className={styles.statLabel}>отзывов</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{profile.stats.completedOrdersCount}</span>
                                    <span className={styles.statLabel}>выполненных заказов</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{profile.stats.repeatOrdersCount}</span>
                                    <span className={styles.statLabel}>повторных заказов</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div >

            <div className={styles.rightColumn}>
                <section className={styles.cardLarge}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Детали</h2>

                        {profile.isOwner ? (
                            isEditingDetails ? (
                                <div className={styles.actionsRow}>
                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={onCancelDetailsEditing}
                                        disabled={isSavingDetails}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={onSaveDetails}
                                        disabled={isSavingDetails}
                                    >
                                        {isSavingDetails ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={onStartDetailsEditing}
                                >
                                    Редактировать
                                </button>
                            )
                        ) : null}
                    </div>

                    {detailsSaveError ? <div className={styles.formError}>{detailsSaveError}</div> : null}

                    <div className={styles.subsection}>
                        <h3>Фотографии специалиста</h3>

                        {isEditingDetails ? (
                            <>
                                {currentSpecialistGallery.length > 0 ? (
                                    <div className={styles.specialistGalleryGrid}>
                                        {currentSpecialistGallery.map((item, index) => (
                                            <div key={item.id} className={styles.specialistGalleryCard}>
                                                <img
                                                    className={styles.specialistGalleryImage}
                                                    src={item.imageUrl}
                                                    alt={item.alt}
                                                />

                                                <button
                                                    type="button"
                                                    className={styles.removeGalleryButton}
                                                    onClick={() => onRemoveSpecialistGalleryImage(index)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.emptyState}>Пока фотографий нет.</p>
                                )}

                                <div className={styles.galleryActions}>
                                    <label className={styles.fileUpload}>
                                        <span>Загрузить с компьютера</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(event) => {
                                                void onAddSpecialistGalleryFiles(event.currentTarget.files);
                                                event.currentTarget.value = '';
                                            }}
                                        />
                                    </label>

                                    <div className={styles.galleryUrlRow}>
                                        <input
                                            className={styles.input}
                                            type="text"
                                            value={detailsForm?.specialistGalleryUrlInput ?? ''}
                                            onChange={(event) =>
                                                onSetSpecialistGalleryUrlInput(event.target.value)
                                            }
                                            placeholder="Ссылка на фото"
                                        />

                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={onAddSpecialistGalleryImageByUrl}
                                        >
                                            Добавить
                                        </button>
                                    </div>
                                </div>

                                {detailsFormErrors.specialistGallery ? (
                                    <p className={styles.fieldError}>{detailsFormErrors.specialistGallery}</p>
                                ) : null}
                            </>
                        ) : (
                            <SpecialistPhotoGallery
                                items={currentSpecialistGallery}
                                title="Фотографии специалиста"
                                emptyText="Пока фотографий нет."
                            />
                        )}
                    </div>

                    <div className={styles.detailsSection}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Опыт ухода за животными</span>

                            {isEditingDetails && detailsForm ? (
                                <div className={styles.experienceEditor}>
                                    <input
                                        className={styles.inlineValueInput}
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={detailsForm.experienceDurationValue}
                                        onChange={(event) =>
                                            onSetDetailsField('experienceDurationValue', event.target.value)
                                        }
                                        placeholder="Число"
                                    />
                                    <select
                                        className={styles.inlineSelect}
                                        value={detailsForm.experienceDurationUnit}
                                        onChange={(event) =>
                                            onSetDetailsField(
                                                'experienceDurationUnit',
                                                event.target.value as SpecialistExperienceUnit,
                                            )
                                        }
                                    >
                                        {Object.entries(SPECIALIST_EXPERIENCE_UNIT_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {detailsFormErrors.experienceDurationValue ? (
                                        <span className={styles.fieldError}>
                                            {detailsFormErrors.experienceDurationValue}
                                        </span>
                                    ) : null}
                                </div>
                            ) : (
                                <span className={styles.detailValue}>{currentExperienceLabel}</span>
                            )}
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Тип жилья</span>

                            {isEditingDetails && detailsForm ? (
                                <select
                                    className={styles.inlineSelect}
                                    value={detailsForm.housingType}
                                    onChange={(event) =>
                                        onSetDetailsField(
                                            'housingType',
                                            event.target.value as SpecialistHousingType,
                                        )
                                    }
                                >
                                    {HOUSING_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {SPECIALIST_HOUSING_TYPE_LABELS[option]}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className={styles.detailValue}>
                                    {SPECIALIST_HOUSING_TYPE_LABELS[currentHousingType]}
                                </span>
                            )}
                        </div>

                        <div className={styles.detailRowWide}>
                            <span className={styles.detailName}>Размер питомцев</span>
                            {isEditingDetails && detailsForm ? (
                                <div className={styles.inlineCheckboxGroup}>
                                    <label className={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            checked={isAllPetSizesSelected}
                                            onChange={() => onToggleAllPetSizes()}
                                        />
                                        <span>Любой</span>
                                    </label>

                                    {PET_SIZE_OPTIONS.map((option) => (
                                        <label key={option} className={styles.checkboxItem}>
                                            <input
                                                type="checkbox"
                                                checked={detailsForm.petSizes.includes(option)}
                                                onChange={() => onTogglePetSize(option)}
                                            />
                                            <span>{SPECIALIST_PET_SIZE_LABELS[option]}</span>
                                        </label>
                                    ))}

                                    {detailsFormErrors.petSizes ? (
                                        <span className={styles.fieldError}>{detailsFormErrors.petSizes}</span>
                                    ) : null}
                                </div>
                            ) : (
                                <span className={styles.detailValue}>
                                    {currentPetSizes.length === PET_SIZE_OPTIONS.length
                                        ? 'Любой'
                                        : currentPetSizes
                                            .map((size) => SPECIALIST_PET_SIZE_LABELS[size])
                                            .join(', ') || '—'}
                                </span>
                            )}
                        </div>

                        <div className={styles.detailRowWide}>
                            <span className={styles.detailName}>Возраст питомцев</span>

                            {isEditingDetails && detailsForm ? (
                                <div className={styles.inlineCheckboxGroup}>
                                    <label className={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            checked={isAllPetAgesSelected}
                                            onChange={() => onToggleAllPetAges()}
                                        />
                                        <span>Любой</span>
                                    </label>

                                    {PET_AGE_OPTIONS.map((option) => (
                                        <label key={option} className={styles.checkboxItem}>
                                            <input
                                                type="checkbox"
                                                checked={detailsForm.petAges.includes(option)}
                                                onChange={() => onTogglePetAge(option)}
                                            />
                                            <span>{SPECIALIST_PET_AGE_LABELS[option]}</span>
                                        </label>
                                    ))}

                                    {detailsFormErrors.petAges ? (
                                        <span className={styles.fieldError}>{detailsFormErrors.petAges}</span>
                                    ) : null}
                                </div>
                            ) : (
                                <span className={styles.detailValue}>
                                    {currentPetAges.length === PET_AGE_OPTIONS.length
                                        ? 'Любой'
                                        : currentPetAges
                                            .map((age) => SPECIALIST_PET_AGE_LABELS[age])
                                            .join(', ') || '—'}
                                </span>
                            )}
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Дети до 10 лет рядом</span>
                            {isEditingDetails && detailsForm ? (
                                <select
                                    className={styles.inlineSelect}
                                    value={detailsForm.hasChildrenUnderTen}
                                    onChange={(event) =>
                                        onSetDetailsField(
                                            'hasChildrenUnderTen',
                                            event.target.value as SpecialistChildrenPolicy,
                                        )
                                    }
                                >
                                    {CHILDREN_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {SPECIALIST_CHILDREN_POLICY_LABELS[option]}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className={styles.detailValue}>
                                    {SPECIALIST_CHILDREN_POLICY_LABELS[currentChildrenPolicy]}
                                </span>
                            )}
                        </div>

                        <div className={styles.detailRowWide}>
                            <span className={styles.detailName}>Типы питомцев</span>

                            {isEditingDetails && detailsForm ? (
                                <div className={styles.inlineCheckboxGroup}>
                                    {PET_TYPE_OPTIONS.map((option) => (
                                        <label key={option} className={styles.checkboxItem}>
                                            <input
                                                type="checkbox"
                                                checked={detailsForm.petTypes.includes(option)}
                                                onChange={() => onTogglePetType(option)}
                                            />
                                            <span>{SPECIALIST_PET_TYPE_LABELS[option]}</span>
                                        </label>
                                    ))}
                                    {detailsFormErrors.petTypes ? (
                                        <span className={styles.fieldError}>{detailsFormErrors.petTypes}</span>
                                    ) : null}
                                </div>
                            ) : (
                                <span className={styles.detailValue}>
                                    {currentPetTypes
                                        .map((petType) => SPECIALIST_PET_TYPE_LABELS[petType])
                                        .join(', ') || '—'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.subsection}>
                        {isEditingDetails && detailsForm ? (
                            <div className={styles.advantagesEditor}>
                                {SPECIALIST_ADVANTAGE_OPTIONS.map((advantage) => (
                                    <label key={advantage} className={styles.advantageItem}>
                                        <input
                                            type="checkbox"
                                            checked={detailsForm.selectedAdvantages.includes(advantage)}
                                            onChange={() => onToggleAdvantage(advantage)}
                                        />
                                        <span>{advantage}</span>
                                    </label>
                                ))}
                                <div className={styles.advantagesHint}>
                                    Выбрано: {detailsForm.selectedAdvantages.length} / 3
                                </div>
                                {detailsFormErrors.selectedAdvantages ? (
                                    <span className={styles.fieldError}>
                                        {detailsFormErrors.selectedAdvantages}
                                    </span>
                                ) : null}
                            </div>
                        ) : currentAdvantages.length > 0 ? (
                            <div className={styles.advantagesList}>
                                {currentAdvantages.map((advantage, index) => (
                                    <div key={`${advantage}-${index}`} className={styles.advantageCard}>
                                        {advantage}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className={styles.subsection}>
                        <div className={styles.subsectionHeader}>
                            <h3 className={styles.subsectionTitle}>Услуги</h3>
                            {isEditingDetails ? (
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={onAddService}
                                >
                                    Добавить услугу
                                </button>
                            ) : null}
                        </div>

                        <div className={styles.servicesList}>
                            {currentServices.length > 0 ? (
                                currentServices.map((service, index) => {
                                    const price = Number(service.price);

                                    return (
                                        <article key={service.id} className={styles.serviceCard}>
                                            {isEditingDetails && detailsForm ? (
                                                <>
                                                    <div className={styles.serviceEditorGrid}>
                                                        <input
                                                            className={styles.input}
                                                            value={detailsForm.services[index]?.name ?? ''}
                                                            onChange={(event) =>
                                                                onSetServiceField(index, 'name', event.target.value)
                                                            }
                                                            placeholder="Название услуги"
                                                        />
                                                        <input
                                                            className={styles.input}
                                                            value={detailsForm.services[index]?.locationLabel ?? ''}
                                                            onChange={(event) =>
                                                                onSetServiceField(index, 'locationLabel', event.target.value)
                                                            }
                                                            placeholder="Где проходит услуга"
                                                        />
                                                    </div>

                                                    <div className={styles.servicePriceEditor}>
                                                        <input
                                                            className={styles.servicePriceInput}
                                                            type="number"
                                                            min="0"
                                                            max={String(MAX_SERVICE_PRICE)}
                                                            step="1"
                                                            value={detailsForm.services[index]?.price ?? '0'}
                                                            onChange={(event) =>
                                                                onSetServiceField(index, 'price', event.target.value)
                                                            }
                                                            placeholder="Цена"
                                                        />
                                                        <select
                                                            className={styles.servicePriceUnitSelect}
                                                            value={detailsForm.services[index]?.priceUnit ?? 'service'}
                                                            onChange={(event) =>
                                                                onSetServiceField(index, 'priceUnit', event.target.value)
                                                            }
                                                        >
                                                            {SERVICE_PRICE_UNIT_OPTIONS.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {SPECIALIST_SERVICE_PRICE_UNIT_LABELS[option]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles.removeButton}
                                                        onClick={() => onRemoveService(index)}
                                                    >
                                                        Удалить услугу
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles.serviceTop}>
                                                        <h4 className={styles.serviceName}>{service.name || 'Без названия'}</h4>
                                                        <div className={styles.servicePriceBlock}>
                                                            <div className={styles.servicePrice}>
                                                                {Number.isFinite(price) && price > 0
                                                                    ? `${formatPrice(price)} ₽`
                                                                    : 'Бесплатно'}
                                                            </div>
                                                            <div className={styles.servicePriceUnit}>
                                                                {SPECIALIST_SERVICE_PRICE_UNIT_LABELS[service.priceUnit]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.serviceMeta}>
                                                        <span>{service.locationLabel || 'Место не указано'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </article>
                                    );
                                })
                            ) : (
                                <p className={styles.emptyText}>Пока услуги не добавлены.</p>
                            )}
                        </div>

                        {detailsFormErrors.services ? (
                            <span className={styles.fieldError}>{detailsFormErrors.services}</span>
                        ) : null}
                    </div>

                    <div className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Обо мне</h3>

                        {isEditingDetails && detailsForm ? (
                            <>
                                <textarea
                                    className={styles.textarea}
                                    rows={10}
                                    value={detailsForm.about}
                                    onChange={(event) => onSetDetailsField('about', event.target.value)}
                                    placeholder="Расскажи о себе, опыте, отношении к животным и условиях передержки"
                                />
                                {detailsFormErrors.about ? (
                                    <span className={styles.fieldError}>{detailsFormErrors.about}</span>
                                ) : null}
                            </>
                        ) : (
                            <div className={styles.aboutText}>
                                {(currentAbout || '')
                                    .split('\n')
                                    .filter((paragraph) => paragraph.trim().length > 0)
                                    .map((paragraph, index) => (
                                        <p key={`${paragraph}-${index}`} className={styles.aboutParagraph}>
                                            {paragraph}
                                        </p>
                                    ))}

                                {!currentAbout.trim() ? (
                                    <p className={styles.emptyText}>Пока описание не заполнено.</p>
                                ) : null}
                            </div>
                        )}
                    </div >

                    <div id="specialist-reviews" className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Отзывы о специалисте</h3>

                        <div className={styles.reviewsList}>
                            {visibleReviews.map((review) => (
                                <article key={review.id} className={styles.reviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <div>
                                            <div className={styles.reviewAuthorRow}>
                                                <span className={styles.reviewAuthor}>{review.authorName}</span>
                                                {review.petName ? (
                                                    <span className={styles.reviewPetName}>
                                                        Питомец: {review.petName}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className={styles.reviewMeta}>
                                                <span>{formatDate(review.createdAt)}</span>
                                                <span>{getRatingStars(review.rating)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className={styles.reviewText}>{review.text}</p>

                                    {review.specialistReply ? (
                                        <div className={styles.replyCard}>
                                            <div className={styles.replyTitle}>Ответ специалиста</div>
                                            <div className={styles.replyDate}>
                                                {formatDate(review.specialistReply.createdAt)}
                                            </div>
                                            <p className={styles.replyText}>{review.specialistReply.text}</p>
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>

                        {canLoadMoreReviews ? (
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={onLoadMoreReviews}
                            >
                                Загрузить еще
                            </button>
                        ) : null}
                    </div>
                </section >
            </div >
        </div >
    );
});