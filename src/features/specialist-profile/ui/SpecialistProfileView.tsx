// src/features/specialist-profile/ui/SpecialistProfileView.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PET_TYPES, PET_WEIGHT_SIZES } from '@/features/pets/model/constants';
import { LocalitySuggestInput } from '@/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput';

import { ReviewsFiltersToolbar } from './ReviewsFiltersToolbar/ReviewsFiltersToolbar';
import { SpecialistMiniCalendar } from './SpecialistMiniCalendar';
import styles from './SpecialistProfileView.module.css';
import { SpecialistServicePolicyEditor } from './SpecialistServicePolicyEditor';
import {
  SPECIALIST_CHILDREN_POLICY_LABELS,
  SPECIALIST_EXPERIENCE_UNIT_LABELS,
  SPECIALIST_HOUSING_TYPE_LABELS,
  SPECIALIST_PET_AGE_LABELS,
  SPECIALIST_PET_SIZE_LABELS,
  SPECIALIST_PET_TYPE_LABELS,
  SPECIALIST_SERVICE_PRICE_UNIT_LABELS,
} from '../model/constants';

import type {
  SpecialistBookingMode,
  SpecialistChildrenPolicy,
  SpecialistExperienceUnit,
  SpecialistHousingType,
  SpecialistPetAge,
  SpecialistPetSize,
  SpecialistPetType,
  SpecialistProfile,
  SpecialistReview,
  SpecialistReviewsRatingFilter,
  SpecialistReviewsReplyFilter,
  SpecialistServicePriceUnit,
} from '../model/types';
import type { ReactNode } from 'react';

type MainForm = {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  middleName: string;
  city: string;
  district: string;
  phone: string;
};

type EditableGalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
};

type EditableServiceBookingPolicyForm = {
  mode: SpecialistBookingMode;
  duration: {
    defaultDurationMinutes: string;
    minDurationMinutes: string;
    maxDurationMinutes: string;
    durationStepMinutes: string;
  };
  buffer: {
    hasBufferBefore: boolean;
    bufferBeforeMinutes: string;
    hasBufferAfter: boolean;
    bufferAfterMinutes: string;
  };
  compatibility: {
    canOverlapWithOtherServices: boolean;
    compatibleServiceIds: string[];
  };
  advance: {
    minAdvanceMinutes: string;
    maxAdvanceDays: string;
  };
  multiDay: {
    allowsMultiDayBooking: boolean;
    minStayDays: string;
    maxStayDays: string;
    checkInTime: string;
    checkOutTime: string;
  };
  allowsClientComment: boolean;
  requiresSpecialistConfirmation: boolean;
};

type EditableServiceFormItem = {
  id: string;
  name: string;
  locationLabel: string;
  description: string;
  price: string;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy: EditableServiceBookingPolicyForm;
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
  reviewsSearchQuery: string;
  reviewsRatingFilter: SpecialistReviewsRatingFilter;
  reviewsReplyFilter: SpecialistReviewsReplyFilter;
  reviewsFilteredCount: number;
  onSetReviewsSearchQuery: (value: string) => void;
  onSetReviewsRatingFilter: (value: SpecialistReviewsRatingFilter) => void;
  onSetReviewsReplyFilter: (value: SpecialistReviewsReplyFilter) => void;

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
    K extends keyof Omit<
      DetailsForm,
      'services' | 'specialistGallery' | 'selectedAdvantages'
    >,
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

  onSetServiceBookingMode: (index: number, mode: SpecialistBookingMode) => void;

  onSetServiceDurationField: (
    index: number,
    field:
      | 'defaultDurationMinutes'
      | 'minDurationMinutes'
      | 'maxDurationMinutes'
      | 'durationStepMinutes',
    value: string,
  ) => void;

  onSetServiceBufferField: (
    index: number,
    field:
      | 'hasBufferBefore'
      | 'bufferBeforeMinutes'
      | 'hasBufferAfter'
      | 'bufferAfterMinutes',
    value: string | boolean,
  ) => void;

  onSetServiceCompatibilityField: (
    index: number,
    field: 'canOverlapWithOtherServices' | 'compatibleServiceIds',
    value: boolean | string[],
  ) => void;

  onSetServiceAdvanceField: (
    index: number,
    field: 'minAdvanceMinutes' | 'maxAdvanceDays',
    value: string,
  ) => void;

  onSetServiceMultiDayField: (
    index: number,
    field:
      | 'allowsMultiDayBooking'
      | 'minStayDays'
      | 'maxStayDays'
      | 'checkInTime'
      | 'checkOutTime',
    value: string | boolean,
  ) => void;

  onSetServiceFlagField: (
    index: number,
    field: 'allowsClientComment' | 'requiresSpecialistConfirmation',
    value: boolean,
  ) => void;

  onSetSpecialistGalleryUrlInput: (value: string) => void;
  onAddSpecialistGalleryImageByUrl: () => void;
  onAddSpecialistGalleryFiles: (files: FileList | null) => Promise<void> | void;
  onRemoveSpecialistGalleryImage: (index: number) => void;
  onSaveDetails: () => void;
  onContactSpecialist?: () => void;
  onBookService?: (serviceId: string) => void;
  /** Ссылки кабинета владельца профиля (только для isOwner). */
  ownerWorkspace?: {
    reviewsPath: string;
    ordersPath: string;
    orderStatsPath: string;
  };
  /** Блок «Оформить заказ» для клиента — показывается вверху колонки с деталями. */
  bookingCta?: ReactNode;
};

const PET_SIZE_OPTIONS: SpecialistPetSize[] = [...PET_WEIGHT_SIZES];
const PET_AGE_OPTIONS: SpecialistPetAge[] = ['baby', 'young', 'adult', 'senior'];
const PET_TYPE_OPTIONS: SpecialistPetType[] = [...PET_TYPES];
const HOUSING_OPTIONS: SpecialistHousingType[] = [
  'apartment',
  'house',
  'townhouse',
  'other',
];
const CHILDREN_OPTIONS: SpecialistChildrenPolicy[] = ['yes', 'no', 'sometimes'];

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

function getRoundedRating(rating: number): number {
  return Math.max(0, Math.min(5, Math.round(rating)));
}

function buildFullName(params: {
  lastName?: string;
  firstName?: string;
  middleName?: string;
}): string {
  return [params.lastName, params.firstName, params.middleName]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function buildInitials(params: { firstName?: string; lastName?: string }): string {
  return `${(params.firstName ?? '').trim().charAt(0)}${(params.lastName ?? '')
    .trim()
    .charAt(0)}`.trim();
}


export const SpecialistProfileView = observer(
  ({
    profile,
    isLoading,
    error,
    visibleReviews,
    canLoadMoreReviews,
    onRetry,
    onLoadMoreReviews,
    reviewsSearchQuery,
    reviewsRatingFilter,
    reviewsReplyFilter,
    reviewsFilteredCount,
    onSetReviewsSearchQuery,
    onSetReviewsRatingFilter,
    onSetReviewsReplyFilter,

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
    onSetServiceBookingMode,
    onSetServiceDurationField,
    onSetServiceBufferField,
    onSetServiceCompatibilityField,
    onSetServiceAdvanceField,
    onSetServiceMultiDayField,
    onSetServiceFlagField,
    onSetSpecialistGalleryUrlInput,
    onAddSpecialistGalleryImageByUrl,
    onAddSpecialistGalleryFiles,
    onRemoveSpecialistGalleryImage,
    onSaveDetails,
    onContactSpecialist,
    onBookService,
    ownerWorkspace,
    bookingCta,
  }: Props) => {
    const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
    const [isAllServicesVisible, setIsAllServicesVisible] = useState(false);
    const isGalleryViewerOpen = activeGalleryIndex !== null;

    useEffect(() => {
      if (!isGalleryViewerOpen) {
        return;
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setActiveGalleryIndex(null);
        }
      };

      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }, [isGalleryViewerOpen]);

    useEffect(() => {
      setIsAllServicesVisible(false);
    }, [profile?.id]);

    if (isLoading) {
      return (
        <div className={styles.stateCard}>
          <h2 className={styles.stateTitle}>Загрузка профиля специалиста</h2>
          <p className={styles.stateText}>
            Подготавливаем данные профиля, календаря и отзывов.
          </p>
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
          <p className={styles.stateText}>
            Специалист с такой ссылкой отсутствует или был удалён.
          </p>
        </div>
      );
    }

    const currentMain = isEditingMain && mainForm ? mainForm : profile.main;
    const currentDetails = isEditingDetails && detailsForm ? detailsForm : null;
    const currentSpecialistGallery = currentDetails
      ? currentDetails.specialistGallery
      : (profile.specialistGallery ?? []);

    const currentName = buildFullName({
      lastName: currentMain.lastName,
      firstName: currentMain.firstName,
      middleName: currentMain.middleName,
    });
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

    const currentPetSizes = currentDetails
      ? currentDetails.petSizes
      : profile.details.petSizes;
    const currentPetAges = currentDetails
      ? currentDetails.petAges
      : profile.details.petAges;
    const currentChildrenPolicy = currentDetails
      ? currentDetails.hasChildrenUnderTen
      : profile.details.hasChildrenUnderTen;
    const currentPetTypes = currentDetails
      ? currentDetails.petTypes
      : profile.details.petTypes;
    const currentAdvantages = currentDetails
      ? currentDetails.selectedAdvantages
      : profile.details.advantages.map((advantage) => advantage.title);

    const currentServices = currentDetails
      ? currentDetails.services.map((service) => ({
          id: service.id,
          name: service.name.trim(),
          locationLabel: service.locationLabel.trim(),
          description: service.description.trim(),
          price: Number(service.price),
          priceUnit: service.priceUnit,
        }))
      : profile.services;
    const hasHiddenServices = !isEditingDetails && currentServices.length > 3;
    const visibleServices =
      hasHiddenServices && !isAllServicesVisible
        ? currentServices.slice(0, 3)
        : currentServices;

    const currentAbout = currentDetails ? currentDetails.about : profile.details.about;
    const galleryItems = currentSpecialistGallery;
    const hasFewGalleryPhotos = galleryItems.length > 0 && galleryItems.length <= 2;
    const shouldCollapseGalleryTail = galleryItems.length > 5;
    const visibleGalleryItems = shouldCollapseGalleryTail
      ? galleryItems.slice(0, 4)
      : galleryItems.slice(0, 5);
    const hiddenGalleryCount = shouldCollapseGalleryTail
      ? Math.max(galleryItems.length - visibleGalleryItems.length, 0)
      : 0;
    const currentGalleryImage =
      activeGalleryIndex !== null ? galleryItems[activeGalleryIndex] : undefined;
    const canPrevGalleryImage = activeGalleryIndex !== null && activeGalleryIndex > 0;
    const canNextGalleryImage =
      activeGalleryIndex !== null && activeGalleryIndex < galleryItems.length - 1;

    const handleOpenGalleryViewer = (index: number): void => {
      if (galleryItems.length === 0) {
        return;
      }

      const safeIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
      setActiveGalleryIndex(safeIndex);
    };

    const handleCloseGalleryViewer = (): void => {
      setActiveGalleryIndex(null);
    };

    const handlePrevGalleryImage = (): void => {
      if (!canPrevGalleryImage || activeGalleryIndex === null) {
        return;
      }

      setActiveGalleryIndex(activeGalleryIndex - 1);
    };

    const handleNextGalleryImage = (): void => {
      if (!canNextGalleryImage || activeGalleryIndex === null) {
        return;
      }

      setActiveGalleryIndex(activeGalleryIndex + 1);
    };

    const isAllPetSizesSelected = currentDetails
      ? currentDetails.petSizes.length === PET_SIZE_OPTIONS.length
      : currentPetSizes.length === PET_SIZE_OPTIONS.length;

    const isAllPetAgesSelected = currentDetails
      ? currentDetails.petAges.length === PET_AGE_OPTIONS.length
      : currentPetAges.length === PET_AGE_OPTIONS.length;

    return (
      <div className={styles.pageContainer}>
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <section className={styles.mainCard}>
              <div className={styles.mainCardHeader}>
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
                      className={styles.editIconButton}
                      aria-label="Редактировать основные данные"
                      onClick={onStartMainEditing}
                    />
                  )
                ) : null}
              </div>

              {mainSaveError ? (
                <div className={styles.formError}>{mainSaveError}</div>
              ) : null}

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
                      {buildInitials({
                        firstName: currentMain.firstName,
                        lastName: currentMain.lastName,
                      })}
                    </div>
                  )}

                  {isEditingMain ? (
                    <div className={styles.inlineAvatarEditor}>
                      <input
                        className={styles.input}
                        value={mainForm?.avatarUrl ?? ''}
                        onChange={(event) =>
                          onSetMainField('avatarUrl', event.target.value)
                        }
                        placeholder="Ссылка на фото"
                      />

                      <label className={styles.uploadButton}>
                        <span>Загрузить</span>
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
                      <input
                        className={styles.inlineTitleInput}
                        value={mainForm?.lastName ?? ''}
                        onChange={(event) =>
                          onSetMainField('lastName', event.target.value)
                        }
                        placeholder="Фамилия"
                      />

                      <input
                        className={styles.inlineTitleInput}
                        value={mainForm?.firstName ?? ''}
                        onChange={(event) =>
                          onSetMainField('firstName', event.target.value)
                        }
                        placeholder="Имя"
                      />

                      <input
                        className={styles.inlineTitleInput}
                        value={mainForm?.middleName ?? ''}
                        onChange={(event) =>
                          onSetMainField('middleName', event.target.value)
                        }
                        placeholder="Отчество"
                      />
                    </div>
                  ) : (
                    <h1 className={styles.specialistName}>
                      {currentName || 'Без имени'}
                    </h1>
                  )}

                  <ul className={styles.metaList}>
                    <li className={styles.metaItem}>
                      <span className={styles.metaLabel}>Город:</span>

                      {isEditingMain ? (
                        <LocalitySuggestInput
                          value={mainForm?.city ?? ''}
                          onChange={(next) => onSetMainField('city', next)}
                          placeholder="Город"
                          inputClassName={styles.inlineValueInput}
                        />
                      ) : (
                        <span className={styles.metaValue}>{currentCity || '—'}</span>
                      )}
                    </li>

                    <li className={styles.metaItem}>
                      <span className={styles.metaLabel}>Район:</span>

                      {isEditingMain ? (
                        <input
                          className={styles.inlineValueInput}
                          value={mainForm?.district ?? ''}
                          onChange={(event) =>
                            onSetMainField('district', event.target.value)
                          }
                          placeholder="Район"
                        />
                      ) : (
                        <span className={styles.metaValue}>{currentDistrict || '—'}</span>
                      )}
                    </li>

                    {profile.isOwner ? (
                      <>
                        <li className={styles.metaItem}>
                          <span className={styles.metaLabel}>Телефон:</span>

                          {isEditingMain ? (
                            <input
                              className={styles.inlineValueInput}
                              value={mainForm?.phone ?? ''}
                              onChange={(event) =>
                                onSetMainField('phone', event.target.value)
                              }
                              placeholder="Телефон"
                            />
                          ) : currentPhone ? (
                            <a
                              className={styles.metaValueMuted}
                              href={`tel:${currentPhone}`}
                            >
                              {formatPhone(currentPhone)}
                            </a>
                          ) : (
                            <span className={styles.metaValueMuted}>—</span>
                          )}
                        </li>

                        <li className={styles.metaItem}>
                          <span className={styles.metaLabel}>Email:</span>
                          <span className={styles.metaValueMuted}>
                            {currentEmail || '—'}
                          </span>
                        </li>
                      </>
                    ) : null}
                  </ul>
                </div>
              </div>
            </section>

            <section className={styles.experienceCard}>
              <span className={styles.experienceLabel}>Опыт работы с животными</span>
              <span className={styles.experienceValue}>
                {profile.stats.experienceYears} лет
              </span>
            </section>

            <SpecialistMiniCalendar
              calendar={profile.calendar}
              editHref={
                profile.isOwner
                  ? `/specialists/${profile.slug.trim()}/calendar/edit`
                  : undefined
              }
            />

            <section className={styles.ratingCard}>
              <div className={styles.ratingTop}>
                <div className={styles.ratingMain}>
                  <img
                    src="/images/specialist-profile/Star.svg"
                    alt=""
                    aria-hidden="true"
                    className={styles.ratingStarIcon}
                  />
                  <span className={styles.ratingValue}>
                    {profile.stats.rating.toFixed(2)}
                  </span>
                </div>

                {!profile.isOwner ? (
                  <a className={styles.reviewsLink} href="#specialist-reviews">
                    Перейти в отзывы →
                  </a>
                ) : null}
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{profile.stats.reviewsCount}</span>
                  <span className={styles.statLabel}>отзывов</span>
                </div>

                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {profile.stats.completedOrdersCount}
                  </span>
                  <span className={styles.statLabel}>заказа выполнено</span>
                </div>

                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {profile.stats.repeatOrdersCount}
                  </span>
                  <span className={styles.statLabel}>повторных заказов</span>
                </div>
              </div>

              {profile.isOwner && ownerWorkspace ? (
                <>
                  <div className={styles.ownerWorkspaceLinks}>
                    <Link
                      className={styles.ownerWorkspaceLink}
                      to={ownerWorkspace.ordersPath}
                    >
                      Заказы клиентов
                    </Link>

                    <Link
                      className={styles.ownerWorkspaceLink}
                      to={ownerWorkspace.orderStatsPath}
                    >
                      Статистика
                    </Link>

                    <Link
                      className={styles.ownerWorkspaceLink}
                      to={ownerWorkspace.reviewsPath}
                    >
                      Ответы
                    </Link>
                  </div>

                  <div className={styles.ownerDangerZone}>
                    <Link className={styles.ownerDangerLink} to="/account/delete">
                      Удаление аккаунта
                    </Link>
                  </div>
                </>
              ) : null}
            </section>
          </div>

          <div className={styles.rightColumn}>
            {bookingCta ? (
              <div className={styles.bookingCtaWrap}>{bookingCta}</div>
            ) : null}

            <section className={styles.detailsCard}>
              <div
                className={`${styles.detailsTop} ${
                  hasFewGalleryPhotos ? styles.detailsTopFewPhotos : ''
                }`}
              >
                <div className={styles.galleryBlock}>
                  <h2 className={styles.cardTitle}>Фотографии специалиста</h2>

                  {isEditingDetails ? (
                    <>
                      {galleryItems.length > 0 ? (
                        <div className={styles.galleryPreviewGrid}>
                          {visibleGalleryItems.map((item, index) => (
                            <div
                              key={item.id}
                              className={
                                index === 0
                                  ? styles.galleryPreviewMain
                                  : styles.galleryPreviewSmall
                              }
                              onClick={() => handleOpenGalleryViewer(index)}
                            >
                              <img src={item.imageUrl} alt={item.alt} />

                              <button
                                type="button"
                                className={styles.galleryRemoveButton}
                                onClick={() => onRemoveSpecialistGalleryImage(index)}
                              >
                                Удалить
                              </button>
                            </div>
                          ))}

                          {hiddenGalleryCount > 0 ? (
                            <div
                              className={styles.galleryMore}
                              onClick={() => handleOpenGalleryViewer(visibleGalleryItems.length)}
                            >
                              +{hiddenGalleryCount}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className={styles.emptyText}>Пока фотографий нет.</p>
                      )}

                      <div className={styles.galleryActions}>
                        <label className={styles.secondaryButton}>
                          <span>Загрузить с компьютера</span>
                          <input
                            className={styles.hiddenFileInput}
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
                    </>
                  ) : galleryItems.length > 0 ? (
                    <div className={styles.galleryPreviewGrid}>
                      {visibleGalleryItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={
                            index === 0
                              ? styles.galleryPreviewMain
                              : styles.galleryPreviewSmall
                          }
                          onClick={() => handleOpenGalleryViewer(index)}
                        >
                          <img src={item.imageUrl} alt={item.alt} />
                        </div>
                      ))}

                      {hiddenGalleryCount > 0 ? (
                        <div
                          className={styles.galleryMore}
                          onClick={() => handleOpenGalleryViewer(visibleGalleryItems.length)}
                        >
                          +{hiddenGalleryCount}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className={styles.emptyText}>Пока фотографий нет.</p>
                  )}
                </div>

                <div className={styles.detailsInfoBlock}>
                  <div className={styles.detailsHeader}>
                    <h2 className={styles.cardTitle}>Детали</h2>

                    <div className={styles.actionsRow}>
                      {onContactSpecialist && !profile.isOwner ? (
                        <button
                          type="button"
                          className={styles.contactButton}
                          onClick={onContactSpecialist}
                        >
                          <img
                            src="/images/specialist-profile/tabler_message.svg"
                            alt=""
                            aria-hidden="true"
                            className={styles.contactButtonIcon}
                          />
                          Связаться
                        </button>
                      ) : null}

                      {profile.isOwner ? (
                        isEditingDetails ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            type="button"
                            className={styles.editIconButton}
                            aria-label="Редактировать детали"
                            onClick={onStartDetailsEditing}
                          />
                        )
                      ) : null}
                    </div>
                  </div>

                  {detailsSaveError ? (
                    <div className={styles.formError}>{detailsSaveError}</div>
                  ) : null}

                  <div className={styles.detailsCompactList}>
                    <div className={styles.detailsCompactRow}>
                      <span>Тип жилья:</span>

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
                        <strong>
                          {SPECIALIST_HOUSING_TYPE_LABELS[currentHousingType]}
                        </strong>
                      )}
                    </div>

                    <div className={styles.detailsCompactRow}>
                      <span>Размер питомца:</span>
                      <strong>
                        {currentPetSizes.length === PET_SIZE_OPTIONS.length
                          ? 'Любой'
                          : currentPetSizes
                              .map((size) => SPECIALIST_PET_SIZE_LABELS[size])
                              .join(', ') || '—'}
                      </strong>
                    </div>

                    <div className={styles.detailsCompactRow}>
                      <span>Возраст питомца:</span>
                      <strong>
                        {currentPetAges.length === PET_AGE_OPTIONS.length
                          ? 'Любой'
                          : currentPetAges
                              .map((age) => SPECIALIST_PET_AGE_LABELS[age])
                              .join(', ') || '—'}
                      </strong>
                    </div>

                    <div className={styles.detailsCompactRow}>
                      <span>Дети до 10 лет:</span>
                      <strong>
                        {SPECIALIST_CHILDREN_POLICY_LABELS[currentChildrenPolicy]}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.petTypesBlock}>
                    <div className={styles.petTypesTitle}>Типы питомцев:</div>

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
                      </div>
                    ) : (
                      <div className={styles.tags}>
                        {currentPetTypes.map((petType) => (
                          <span key={petType} className={styles.tag}>
                            {SPECIALIST_PET_TYPE_LABELS[petType]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <section className={styles.servicesSection}>
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
                    visibleServices.map((service, index) => {
                      const price = Number(service.price);

                      return (
                        <article key={service.id} className={styles.serviceCard}>
                          {isEditingDetails && detailsForm ? (
                            <>
                              <SpecialistServicePolicyEditor
                                service={detailsForm.services[index]}
                                index={index}
                                allServices={detailsForm.services}
                                onSetServiceField={onSetServiceField}
                                onSetServiceBookingMode={onSetServiceBookingMode}
                                onSetServiceDurationField={onSetServiceDurationField}
                                onSetServiceBufferField={onSetServiceBufferField}
                                onSetServiceCompatibilityField={
                                  onSetServiceCompatibilityField
                                }
                                onSetServiceAdvanceField={onSetServiceAdvanceField}
                                onSetServiceMultiDayField={onSetServiceMultiDayField}
                                onSetServiceFlagField={onSetServiceFlagField}
                              />

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
                                <div>
                                  <h4 className={styles.serviceName}>
                                    {service.name || 'Без названия'}
                                  </h4>

                                  <p className={styles.serviceDescription}>
                                    {service.description ||
                                      service.locationLabel ||
                                      'Описание услуги не указано'}
                                  </p>
                                </div>

                                <div className={styles.servicePriceBlock}>
                                  <div className={styles.servicePrice}>
                                    {Number.isFinite(price) && price > 0
                                      ? `от ${formatPrice(price)} ₽`
                                      : 'Бесплатно'}
                                  </div>

                                  <div className={styles.servicePriceUnit}>
                                    {
                                      SPECIALIST_SERVICE_PRICE_UNIT_LABELS[
                                        service.priceUnit
                                      ]
                                    }
                                  </div>
                                </div>
                              </div>

                              {!profile.isOwner &&
                              (onBookService || onContactSpecialist) ? (
                                <div className={styles.serviceActions}>
                                  <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => {
                                      if (onBookService) {
                                        onBookService(service.id);
                                        return;
                                      }

                                      onContactSpecialist?.();
                                    }}
                                  >
                                    Записаться на услугу
                                  </button>

                                  {onContactSpecialist ? (
                                    <button
                                      type="button"
                                      className={styles.secondaryButton}
                                      onClick={onContactSpecialist}
                                    >
                                      Обсудить детали
                                    </button>
                                  ) : null}
                                </div>
                              ) : null}
                              
                            </>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <p className={styles.emptyText}>Пока услуги не добавлены.</p>
                  )}
                </div>

                {hasHiddenServices ? (
                  <button
                    type="button"
                    className={`${styles.secondaryButton} ${styles.showMoreServicesButton}`}
                    onClick={() => setIsAllServicesVisible((prev) => !prev)}
                  >
                    {isAllServicesVisible ? 'Скрыть услуги' : 'Показать еще'}
                  </button>
                ) : null}
              </section>

              <section className={styles.aboutSection}>
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
                        <p
                          key={`${paragraph}-${index}`}
                          className={styles.aboutParagraph}
                        >
                          {paragraph}
                        </p>
                      ))}

                    {!currentAbout.trim() ? (
                      <p className={styles.emptyText}>Пока описание не заполнено.</p>
                    ) : null}
                  </div>
                )}
              </section>

              <section id="specialist-reviews" className={styles.reviewsSection}>
                <h3 className={styles.subsectionTitle}>Отзывы о специалисте</h3>

                {profile.isOwner && ownerWorkspace ? (
                  <p className={styles.reviewsOwnerNote}>
                    Ответы на отзывы оформляются на отдельной странице:{' '}
                    <Link className={styles.inlineLink} to={ownerWorkspace.reviewsPath}>
                      открыть раздел ответов
                    </Link>
                    .
                  </p>
                ) : null}

                {profile.reviews.length > 0 ? (
                  <ReviewsFiltersToolbar
                    searchQuery={reviewsSearchQuery}
                    ratingFilter={reviewsRatingFilter}
                    replyFilter={reviewsReplyFilter}
                    totalCount={profile.reviews.length}
                    filteredCount={reviewsFilteredCount}
                    onSearchChange={onSetReviewsSearchQuery}
                    onRatingFilterChange={onSetReviewsRatingFilter}
                    onReplyFilterChange={onSetReviewsReplyFilter}
                  />
                ) : null}

                {profile.reviews.length === 0 ? (
                  <p className={styles.emptyText}>Пока отзывов нет.</p>
                ) : reviewsFilteredCount === 0 ? (
                  <p className={styles.emptyText}>
                    Ничего не найдено. Измените поиск или фильтры.
                  </p>
                ) : (
                  <>
                    <div className={styles.reviewsList}>
                      {visibleReviews.map((review) => (
                        <article key={review.id} className={styles.reviewCard}>
                          <div className={styles.reviewHeader}>
                            <div>
                              <div className={styles.reviewMeta}>
                                <span className={styles.reviewDate}>
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>

                              <h4 className={styles.reviewService}>Передержка</h4>

                              <div className={styles.reviewAuthorRow}>
                                <span className={styles.reviewAuthor}>
                                  {review.authorName}
                                </span>

                                {review.petName ? (
                                  <span className={styles.reviewPetName}>
                                    Питомец: {review.petName}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className={styles.reviewStars}>
                              {Array.from({ length: 5 }, (_, index) => (
                                <img
                                  key={`${review.id}-star-${index}`}
                                  src="/images/specialist-profile/Star.svg"
                                  alt=""
                                  aria-hidden="true"
                                  className={
                                    index < getRoundedRating(review.rating)
                                      ? styles.reviewStarIcon
                                      : styles.reviewStarIconInactive
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <p className={styles.reviewText}>{review.text}</p>

                          {review.specialistReply ? (
                            <div className={styles.replyCard}>
                              <div className={styles.reviewDate}>
                                {formatDate(review.specialistReply.createdAt)}
                              </div>

                              <div className={styles.replyTitle}>Ответ специалиста</div>

                              <p className={styles.replyText}>
                                {review.specialistReply.text}
                              </p>
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>

                    {canLoadMoreReviews ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onLoadMoreReviews}
                      >
                        Загрузить еще
                      </button>
                    ) : null}
                  </>
                )}
              </section>
            </section>
          </div>
        </div>

        {isGalleryViewerOpen && currentGalleryImage ? (
          <div
            className={styles.galleryViewerOverlay}
            onClick={handleCloseGalleryViewer}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографий специалиста"
          >
            <div
              className={styles.galleryViewerModal}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.galleryViewerClose}
                onClick={handleCloseGalleryViewer}
                aria-label="Закрыть"
              >
                ✕
              </button>

              <div className={styles.galleryViewerImageWrap}>
                <img
                  className={styles.galleryViewerImage}
                  src={currentGalleryImage.imageUrl}
                  alt={currentGalleryImage.alt || 'Фотография специалиста'}
                />
              </div>

              <div className={styles.galleryViewerControls}>
                <button
                  type="button"
                  className={styles.galleryViewerArrow}
                  disabled={!canPrevGalleryImage}
                  onClick={handlePrevGalleryImage}
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <span className={styles.galleryViewerCounter}>
                  {(activeGalleryIndex ?? 0) + 1} / {galleryItems.length}
                </span>
                <button
                  type="button"
                  className={styles.galleryViewerArrow}
                  disabled={!canNextGalleryImage}
                  onClick={handleNextGalleryImage}
                  aria-label="Следующее фото"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
