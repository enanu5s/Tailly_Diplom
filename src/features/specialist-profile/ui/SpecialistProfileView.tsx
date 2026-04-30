// src/features/specialist-profile/ui/SpecialistProfileView.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PET_WEIGHT_SIZES } from '@/features/pets/model/constants';
import { LocalitySuggestInput } from '@/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput';

import { SpecialistMiniCalendar } from './SpecialistMiniCalendar';
import styles from './SpecialistProfileView.module.css';
import {
  SPECIALIST_CHILDREN_POLICY_LABELS,
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
  SpecialistPetTypeAliasOption,
  SpecialistProfile,
  SpecialistReview,
  SpecialistServiceCatalogItem,
  SpecialistServicePriceUnit,
} from '../model/types';
import type { ReactNode } from 'react';

type ReviewsSortOption = 'newest' | 'oldest' | 'rating_asc' | 'rating_desc';

type MainForm = {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  middleName: string;
  city: string;
  district: string;
  phone: string;
  email: string;
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
  isEmailChangeModalOpen: boolean;
  pendingEmailChange: string | null;
  emailChangeCodeInput: string;
  emailChangeError: string | null;
  emailChangeStep: 'verify' | 'success';
  isRequestingEmailChangeCode: boolean;
  isVerifyingEmailChangeCode: boolean;
  onCloseEmailChangeModal: () => void;
  onSetEmailChangeCodeInput: (value: string) => void;
  onRequestEmailChangeCode: () => void;
  onConfirmEmailChangeCode: () => void;

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

  onSetSpecialistGalleryUrlInput: (value: string) => void;
  onAddSpecialistGalleryImageByUrl: () => void;
  onAddSpecialistGalleryFiles: (files: FileList | null) => Promise<void> | void;
  onRemoveSpecialistGalleryImage: (index: number) => void;
  serviceCatalogOptions: SpecialistServiceCatalogItem[];
  petTypeAliasOptions: SpecialistPetTypeAliasOption[];
  onSaveDetails: () => void;
  onContactSpecialist?: () => void;
  onBookService?: (serviceId: string) => void;
  /** Ссылки кабинета владельца профиля (только для isOwner). */
  ownerWorkspace?: {
    reviewsPath: string;
    ordersPath: string;
    orderStatsPath: string;
    shopOrdersPath: string;
    pendingConfirmationCount: number;
  };
  /** Блок «Оформить заказ» для клиента — показывается вверху колонки с деталями. */
  bookingCta?: ReactNode;
};

const PET_SIZE_OPTIONS: SpecialistPetSize[] = [...PET_WEIGHT_SIZES];
const PET_AGE_OPTIONS: SpecialistPetAge[] = ['baby', 'young', 'adult', 'senior'];
const DEFAULT_PET_TYPE_ALIAS_OPTIONS: SpecialistPetTypeAliasOption[] = [
  { id: 'cat', label: 'Кошка', type: 'cat' },
  { id: 'dog', label: 'Собака', type: 'dog' },
  { id: 'fish', label: 'Рыбка', type: 'fish' },
  { id: 'hamster', label: 'Хомяк', type: 'rodent' },
  { id: 'guinea-pig', label: 'Морская свинка', type: 'rodent' },
  { id: 'rabbit', label: 'Кролик', type: 'rabbit' },
  { id: 'turtle', label: 'Черепаха', type: 'reptile' },
  { id: 'rat', label: 'Крыса', type: 'rodent' },
  { id: 'mouse', label: 'Мышь', type: 'rodent' },
  { id: 'bird', label: 'Птица', type: 'bird' },
  { id: 'chinchilla', label: 'Шиншилла', type: 'rodent' },
  { id: 'ferret', label: 'Хорек', type: 'rodent' },
  { id: 'lizard', label: 'Ящерица', type: 'reptile' },
  { id: 'snake', label: 'Змея', type: 'reptile' },
  { id: 'snail', label: 'Улитка', type: 'reptile' },
];
const HOUSING_OPTIONS: SpecialistHousingType[] = [
  'apartment',
  'house',
  'townhouse',
  'other',
];

function resolvePetSizeGroup(
  value: SpecialistPetSize[],
): 'any' | 'small' | 'medium' | 'large' {
  if (value.length === PET_SIZE_OPTIONS.length) {
    return 'any';
  }

  const small = PET_SIZE_OPTIONS.slice(0, 2);
  const medium = PET_SIZE_OPTIONS.slice(2, 4);
  const large = PET_SIZE_OPTIONS.slice(4);

  if (value.every((item) => small.includes(item))) {
    return 'small';
  }

  if (value.every((item) => medium.includes(item))) {
    return 'medium';
  }

  if (value.every((item) => large.includes(item))) {
    return 'large';
  }

  return 'any';
}

function mapPetSizeGroupToValue(
  group: 'any' | 'small' | 'medium' | 'large',
): SpecialistPetSize[] {
  if (group === 'any') {
    return [...PET_SIZE_OPTIONS];
  }

  if (group === 'small') {
    return [...PET_SIZE_OPTIONS.slice(0, 2)];
  }

  if (group === 'medium') {
    return [...PET_SIZE_OPTIONS.slice(2, 4)];
  }

  return [...PET_SIZE_OPTIONS.slice(4)];
}

function resolvePetAgeGroup(
  value: SpecialistPetAge[],
): 'any' | 'newborn' | 'baby' | 'teen' | 'adult' | 'senior' {
  if (value.length === PET_AGE_OPTIONS.length) {
    return 'any';
  }

  if (value.length === 1 && value[0] === 'baby') {
    return 'baby';
  }

  if (value.length === 1 && value[0] === 'young') {
    return 'teen';
  }

  if (value.length === 1 && value[0] === 'adult') {
    return 'adult';
  }

  if (value.length === 1 && value[0] === 'senior') {
    return 'senior';
  }

  return 'any';
}

function mapPetAgeGroupToValue(
  group: 'any' | 'newborn' | 'baby' | 'teen' | 'adult' | 'senior',
): SpecialistPetAge[] {
  if (group === 'any') {
    return [...PET_AGE_OPTIONS];
  }
  if (group === 'newborn' || group === 'baby') {
    return ['baby'];
  }
  if (group === 'teen') {
    return ['young'];
  }
  if (group === 'adult') {
    return ['adult'];
  }
  return ['senior'];
}

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

    isEditingMain,
    isSavingMain,
    mainSaveError,
    mainForm,
    mainFormErrors: _mainFormErrors,
    onStartMainEditing,
    onCancelMainEditing,
    onSetMainField,
    onSetMainAvatarFile,
    onSaveMain,
    isEmailChangeModalOpen,
    pendingEmailChange,
    emailChangeCodeInput,
    emailChangeError,
    emailChangeStep,
    isRequestingEmailChangeCode,
    isVerifyingEmailChangeCode,
    onCloseEmailChangeModal,
    onSetEmailChangeCodeInput,
    onRequestEmailChangeCode,
    onConfirmEmailChangeCode,

    isEditingDetails,
    isSavingDetails,
    detailsSaveError,
    detailsForm,
    detailsFormErrors,
    onStartDetailsEditing,
    onCancelDetailsEditing,
    onSetDetailsField,
    onTogglePetSize: _onTogglePetSize,
    onToggleAllPetSizes: _onToggleAllPetSizes,
    onTogglePetAge: _onTogglePetAge,
    onToggleAllPetAges: _onToggleAllPetAges,
    onTogglePetType: _onTogglePetType,
    onToggleAdvantage: _onToggleAdvantage,
    onAddService,
    onRemoveService,
    onSetServiceField,
    onSetSpecialistGalleryUrlInput,
    onAddSpecialistGalleryImageByUrl,
    onAddSpecialistGalleryFiles,
    onRemoveSpecialistGalleryImage,
    serviceCatalogOptions,
    petTypeAliasOptions,
    onSaveDetails,
    onContactSpecialist,
    onBookService,
    ownerWorkspace,
    bookingCta,
  }: Props) => {
    const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
    const [isAllServicesVisible, setIsAllServicesVisible] = useState(false);
    const [selectedPetTypeAliases, setSelectedPetTypeAliases] = useState<string[]>([]);
    const [isCompactGalleryLayout, setIsCompactGalleryLayout] = useState(false);
    const [reviewsSort, setReviewsSort] = useState<ReviewsSortOption>('newest');
    const [activeReviewPhotoIndex, setActiveReviewPhotoIndex] = useState<number | null>(null);
    const [activeReviewPhotos, setActiveReviewPhotos] = useState<string[]>([]);
    const isGalleryViewerOpen = activeGalleryIndex !== null;
    const effectivePetTypeAliasOptions =
      petTypeAliasOptions.length > 0
        ? petTypeAliasOptions
        : DEFAULT_PET_TYPE_ALIAS_OPTIONS;
    const ownerTopPanelDateLabel = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

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

    useEffect(() => {
      if (!isEditingDetails || !detailsForm) {
        setSelectedPetTypeAliases([]);
        return;
      }

      const aliasByType = new Map<SpecialistPetType, string>();
      for (const option of effectivePetTypeAliasOptions) {
        if (!aliasByType.has(option.type)) {
          aliasByType.set(option.type, option.id);
        }
      }

      setSelectedPetTypeAliases(
        detailsForm.petTypes.map((type) => aliasByType.get(type) ?? type),
      );
    }, [isEditingDetails, detailsForm, effectivePetTypeAliasOptions]);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(max-width: 1500px)');
      const syncLayout = (): void => {
        setIsCompactGalleryLayout(mediaQuery.matches);
      };

      syncLayout();
      mediaQuery.addEventListener('change', syncLayout);

      return () => {
        mediaQuery.removeEventListener('change', syncLayout);
      };
    }, []);

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
    const maxVisibleGalleryItems = isCompactGalleryLayout ? 3 : 5;
    const shouldCollapseGalleryTail = galleryItems.length > maxVisibleGalleryItems;
    const visibleGalleryItems = shouldCollapseGalleryTail
      ? galleryItems.slice(0, maxVisibleGalleryItems - 1)
      : galleryItems.slice(0, maxVisibleGalleryItems);
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

    const handleRemoveGalleryImageFromViewer = (): void => {
      if (!isEditingDetails || activeGalleryIndex === null) {
        return;
      }

      const nextGalleryLength = galleryItems.length - 1;
      onRemoveSpecialistGalleryImage(activeGalleryIndex);

      if (nextGalleryLength <= 0) {
        setActiveGalleryIndex(null);
        return;
      }

      setActiveGalleryIndex((prev) => {
        if (prev === null) {
          return 0;
        }
        return Math.min(prev, nextGalleryLength - 1);
      });
    };

    const selectedPetSizeGroup = resolvePetSizeGroup(currentPetSizes);
    const selectedPetAgeGroup = resolvePetAgeGroup(currentPetAges);
    const sortedVisibleReviews = [...visibleReviews].sort((left, right) => {
      if (reviewsSort === 'newest') {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
      if (reviewsSort === 'oldest') {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }
      if (reviewsSort === 'rating_asc') {
        return left.rating - right.rating;
      }
      return right.rating - left.rating;
    });
    const isReviewViewerOpen =
      activeReviewPhotoIndex !== null && activeReviewPhotos.length > 0;
    const currentReviewPhoto =
      activeReviewPhotoIndex !== null ? activeReviewPhotos[activeReviewPhotoIndex] : undefined;
    const canPrevReviewPhoto = activeReviewPhotoIndex !== null && activeReviewPhotoIndex > 0;
    const canNextReviewPhoto =
      activeReviewPhotoIndex !== null &&
      activeReviewPhotoIndex < activeReviewPhotos.length - 1;

    const handleOpenReviewViewer = (photos: string[], index = 0): void => {
      if (photos.length === 0) {
        return;
      }
      setActiveReviewPhotos(photos);
      setActiveReviewPhotoIndex(Math.max(0, Math.min(index, photos.length - 1)));
    };

    const handleCloseReviewViewer = (): void => {
      setActiveReviewPhotoIndex(null);
      setActiveReviewPhotos([]);
    };

    const handlePrevReviewPhoto = (): void => {
      if (!canPrevReviewPhoto || activeReviewPhotoIndex === null) {
        return;
      }
      setActiveReviewPhotoIndex(activeReviewPhotoIndex - 1);
    };

    const handleNextReviewPhoto = (): void => {
      if (!canNextReviewPhoto || activeReviewPhotoIndex === null) {
        return;
      }
      setActiveReviewPhotoIndex(activeReviewPhotoIndex + 1);
    };

    const togglePetTypeAlias = (aliasId: string): void => {
      if (!detailsForm || !isEditingDetails) {
        return;
      }

      const nextAliases = selectedPetTypeAliases.includes(aliasId)
        ? selectedPetTypeAliases.filter((item) => item !== aliasId)
        : [...selectedPetTypeAliases, aliasId];

      setSelectedPetTypeAliases(nextAliases);

      const nextTypes = Array.from(
        new Set(
          nextAliases
            .map(
              (id) =>
                effectivePetTypeAliasOptions.find((option) => option.id === id)?.type,
            )
            .filter((value): value is SpecialistPetType => Boolean(value)),
        ),
      );

      onSetDetailsField('petTypes', nextTypes);
    };

    return (
      <div className={styles.pageContainer}>
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <section className={styles.mainCard}>
              <div className={styles.mainCardHeader}>
                <h2 className={styles.cardTitle}>Основные данные</h2>

                {profile.isOwner && !isEditingMain ? (
                  <button
                    type="button"
                    className={styles.editIconButton}
                    aria-label="Редактировать основные данные"
                    onClick={onStartMainEditing}
                  />
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

                  <ul
                    className={
                      isEditingMain
                        ? `${styles.metaList} ${styles.metaListEditing}`
                        : styles.metaList
                    }
                  >
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
                          {isEditingMain ? (
                            <input
                              className={styles.inlineValueInput}
                              value={mainForm?.email ?? ''}
                              onChange={(event) =>
                                onSetMainField('email', event.target.value)
                              }
                              placeholder="Email"
                            />
                          ) : (
                            <span className={styles.metaValueMuted}>
                              {currentEmail || '—'}
                            </span>
                          )}
                        </li>
                      </>
                    ) : null}
                  </ul>
                </div>
              </div>
              {profile.isOwner && isEditingMain ? (
                <div className={styles.bottomActions}>
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
              ) : null}
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
            </section>
          </div>

          <div className={styles.rightColumn}>
            {profile.isOwner && ownerWorkspace ? (
              <section className={styles.ownerTopPanel}>
                <span className={styles.ownerTopPanelDate}>{ownerTopPanelDateLabel}</span>

                <div className={styles.ownerTopPanelActions}>
                  <Link
                    className={styles.ownerStatsButton}
                    to={ownerWorkspace.orderStatsPath}
                  >
                    Статистика заказов
                  </Link>

                  <Link
                    className={styles.ownerShopOrdersButton}
                    to={ownerWorkspace.shopOrdersPath}
                  >
                    Заказы из магазина
                  </Link>

                  <Link
                    className={styles.ownerClientsOrdersButton}
                    to={ownerWorkspace.ordersPath}
                  >
                    Заказы клиентов
                    {ownerWorkspace.pendingConfirmationCount > 0 ? (
                      <span className={styles.ownerClientsOrdersBadge}>
                        {ownerWorkspace.pendingConfirmationCount}
                      </span>
                    ) : null}
                  </Link>
                </div>
              </section>
            ) : null}

            {bookingCta ? (
              <div className={styles.bookingCtaWrap}>{bookingCta}</div>
            ) : null}

            <section
              className={
                profile.isOwner && isEditingDetails
                  ? `${styles.detailsCard} ${styles.detailsCardEditing}`
                  : styles.detailsCard
              }
            >
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
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onRemoveSpecialistGalleryImage(index);
                                }}
                              >
                                Удалить
                              </button>
                            </div>
                          ))}

                          {hiddenGalleryCount > 0 ? (
                            <div
                              className={styles.galleryMore}
                              onClick={() =>
                                handleOpenGalleryViewer(visibleGalleryItems.length)
                              }
                            >
                              +{hiddenGalleryCount}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className={styles.emptyText}>Пока фотографий нет.</p>
                      )}

                      <div className={styles.galleryActions}>
                        <label className={styles.addPhotosButton}>
                          <img
                            src="/images/specialist-profile/plus-icon.svg"
                            alt=""
                            aria-hidden="true"
                            className={styles.addButtonIcon}
                          />
                          <span>Добавить фотографии</span>
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
                          onClick={() =>
                            handleOpenGalleryViewer(visibleGalleryItems.length)
                          }
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

                    {profile.isOwner && !isEditingDetails ? (
                      <button
                        type="button"
                        className={styles.editIconButton}
                        aria-label="Редактировать детали"
                        onClick={onStartDetailsEditing}
                      />
                    ) : null}
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
                      {isEditingDetails && detailsForm ? (
                        <select
                          className={styles.inlineSelect}
                          value={selectedPetSizeGroup}
                          onChange={(event) =>
                            onSetDetailsField(
                              'petSizes',
                              mapPetSizeGroupToValue(
                                event.target.value as
                                  | 'any'
                                  | 'small'
                                  | 'medium'
                                  | 'large',
                              ),
                            )
                          }
                        >
                          <option value="any">Любой</option>
                          <option value="small">Маленький</option>
                          <option value="medium">Средний</option>
                          <option value="large">Большой</option>
                        </select>
                      ) : (
                        <strong>
                          {currentPetSizes.length === PET_SIZE_OPTIONS.length
                            ? 'Любой'
                            : currentPetSizes
                                .map((size) => SPECIALIST_PET_SIZE_LABELS[size])
                                .join(', ') || '—'}
                        </strong>
                      )}
                    </div>

                    <div className={styles.detailsCompactRow}>
                      <span>Возраст питомца:</span>
                      {isEditingDetails && detailsForm ? (
                        <select
                          className={styles.inlineSelect}
                          value={selectedPetAgeGroup}
                          onChange={(event) =>
                            onSetDetailsField(
                              'petAges',
                              mapPetAgeGroupToValue(
                                event.target.value as
                                  | 'any'
                                  | 'newborn'
                                  | 'baby'
                                  | 'teen'
                                  | 'adult'
                                  | 'senior',
                              ),
                            )
                          }
                        >
                          <option value="any">Любой</option>
                          <option value="newborn">Новорожденный</option>
                          <option value="baby">Малыш</option>
                          <option value="teen">Подросток</option>
                          <option value="adult">Взрослый</option>
                          <option value="senior">Пожилой</option>
                        </select>
                      ) : (
                        <strong>
                          {currentPetAges.length === PET_AGE_OPTIONS.length
                            ? 'Любой'
                            : currentPetAges
                                .map((age) => SPECIALIST_PET_AGE_LABELS[age])
                                .join(', ') || '—'}
                        </strong>
                      )}
                    </div>

                    <div className={styles.detailsCompactRow}>
                      <span>Дети до 10 лет:</span>
                      {isEditingDetails && detailsForm ? (
                        <select
                          className={styles.inlineSelect}
                          value={currentChildrenPolicy === 'yes' ? 'yes' : 'no'}
                          onChange={(event) =>
                            onSetDetailsField(
                              'hasChildrenUnderTen',
                              event.target.value === 'yes' ? 'yes' : 'no',
                            )
                          }
                        >
                          <option value="no">Нет</option>
                          <option value="yes">Да</option>
                        </select>
                      ) : (
                        <strong>
                          {SPECIALIST_CHILDREN_POLICY_LABELS[currentChildrenPolicy]}
                        </strong>
                      )}
                    </div>
                  </div>

                  <div className={styles.petTypesBlock}>
                    <div className={styles.petTypesTitle}>Типы питомцев:</div>

                    {isEditingDetails && detailsForm ? (
                      <div className={styles.petTypeTagGrid}>
                        {effectivePetTypeAliasOptions.map((option) => {
                          const isSelected = selectedPetTypeAliases.includes(option.id);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={
                                isSelected
                                  ? `${styles.petTypeChip} ${styles.petTypeChipActive}`
                                  : styles.petTypeChip
                              }
                              onClick={() => togglePetTypeAlias(option.id)}
                            >
                              <span>{option.label}</span>
                              {isSelected ? (
                                <span className={styles.petTypeChipClose}>✕</span>
                              ) : null}
                            </button>
                          );
                        })}
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
                </div>

                <div className={styles.servicesList}>
                  {currentServices.length > 0 ? (
                    visibleServices.map((service, index) => {
                      const price = Number(service.price);
                      const hasServiceActions =
                        !profile.isOwner && Boolean(onBookService || onContactSpecialist);

                      return (
                        <article
                          key={service.id}
                          className={
                            hasServiceActions
                              ? styles.serviceCard
                              : `${styles.serviceCard} ${styles.serviceCardCompact}`
                          }
                        >
                          {isEditingDetails && detailsForm ? (
                            <>
                              <div className={styles.serviceEditorTopRow}>
                                <select
                                  className={`${styles.inlineSelect} ${styles.serviceEditorNameSelect}`}
                                  value={detailsForm.services[index]?.name ?? ''}
                                  onChange={(event) =>
                                    onSetServiceField(index, 'name', event.target.value)
                                  }
                                >
                                  <option value="">Выберите услугу</option>
                                  {(serviceCatalogOptions.length > 0
                                    ? serviceCatalogOptions
                                    : detailsForm.services.map((service) => ({
                                        id: service.id,
                                        name: service.name,
                                      }))
                                  ).map((option, optionIndex) => (
                                    <option
                                      key={`${option.id}-${optionIndex}`}
                                      value={option.name}
                                    >
                                      {option.name || `Услуга ${optionIndex + 1}`}
                                    </option>
                                  ))}
                                </select>

                                <div className={styles.serviceEditorPriceWrap}>
                                  <span className={styles.serviceEditorPricePrefix}>
                                    от
                                  </span>
                                  <input
                                    className={`${styles.inlineTitleInput} ${styles.serviceEditorPriceInput}`}
                                    value={detailsForm.services[index]?.price ?? ''}
                                    onChange={(event) =>
                                      onSetServiceField(
                                        index,
                                        'price',
                                        event.target.value,
                                      )
                                    }
                                    placeholder="0"
                                  />
                                  <span className={styles.serviceEditorPriceCurrency}>
                                    ₽
                                  </span>
                                </div>
                              </div>

                              <label className={styles.serviceEditorLabel}>
                                Описание услуги (детали):
                              </label>
                              <input
                                className={`${styles.input} ${styles.serviceEditorDescriptionInput}`}
                                value={detailsForm.services[index]?.description ?? ''}
                                onChange={(event) =>
                                  onSetServiceField(
                                    index,
                                    'description',
                                    event.target.value,
                                  )
                                }
                                placeholder="Описание услуги"
                              />

                              <div className={styles.serviceEditorBottomRow}>
                                <button
                                  type="button"
                                  className={styles.removeButton}
                                  onClick={() => onRemoveService(index)}
                                >
                                  Удалить услугу
                                </button>

                                <select
                                  className={`${styles.inlineSelect} ${styles.serviceEditorUnitSelect}`}
                                  value={
                                    detailsForm.services[index]?.priceUnit ?? 'service'
                                  }
                                  onChange={(event) =>
                                    onSetServiceField(
                                      index,
                                      'priceUnit',
                                      event.target.value,
                                    )
                                  }
                                >
                                  <option value="hour">за час</option>
                                  <option value="day">за день</option>
                                  <option value="service">за услугу</option>
                                  <option value="walk">за прогулку</option>
                                  <option value="visit">за визит</option>
                                </select>
                              </div>
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

                              {hasServiceActions ? (
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

                {isEditingDetails ? (
                  <div className={styles.addServiceBottomRow}>
                    <button
                      type="button"
                      className={styles.addServiceButton}
                      onClick={onAddService}
                    >
                      <img
                        src="/images/specialist-profile/plus-icon.svg"
                        alt=""
                        aria-hidden="true"
                        className={styles.addButtonIcon}
                      />
                      <span>Добавить услугу</span>
                    </button>
                  </div>
                ) : null}

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

              {profile.isOwner && isEditingDetails ? (
                <div className={styles.detailsEditingBottomActions}>
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
              ) : null}

              <section id="specialist-reviews" className={styles.reviewsSection}>
                <div className={styles.reviewsHeaderRow}>
                  <h3 className={styles.subsectionTitle}>Отзывы о специалисте</h3>
                  <select
                    className={styles.reviewsSortSelect}
                    value={reviewsSort}
                    onChange={(event) =>
                      setReviewsSort(event.target.value as ReviewsSortOption)
                    }
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="oldest">Сначала старые</option>
                    <option value="rating_asc">Оценка по возрастанию</option>
                    <option value="rating_desc">Оценка по убыванию</option>
                  </select>
                </div>

                {profile.reviews.length === 0 ? (
                  <p className={styles.emptyText}>Пока отзывов нет.</p>
                ) : (
                  <>
                    <div className={styles.reviewsList}>
                      {sortedVisibleReviews.map((review) => {
                        const reviewPhotos = review.photos ?? [];
                        const reviewImageUrl = reviewPhotos[0] ?? null;
                        const hasReplySection = Boolean(
                          review.specialistReply || profile.isOwner,
                        );

                        return (
                          <article
                            key={review.id}
                            className={`${styles.reviewCard} ${
                              reviewImageUrl
                                ? styles.reviewCardWithImage
                                : styles.reviewCardWithoutImage
                            } ${
                              hasReplySection ? '' : styles.reviewCardWithoutReplySection
                            }`}
                          >
                            {reviewImageUrl ? (
                              <div className={styles.reviewPhotoWrap}>
                                <img
                                  className={styles.reviewPhoto}
                                  src={reviewImageUrl}
                                  alt=""
                                  aria-hidden="true"
                                  onClick={() => handleOpenReviewViewer(reviewPhotos, 0)}
                                />

                                <span className={styles.reviewPhotoCount}>
                                  +{reviewPhotos.length}
                                </span>
                              </div>
                            ) : null}

                            <div className={styles.reviewContent}>
                              <div className={styles.reviewHeader}>
                                <span className={styles.reviewDate}>
                                  {formatDate(review.createdAt)}
                                </span>

                                <div className={styles.reviewStars}>
                                  {Array.from({ length: 5 }, (_, starIndex) => (
                                    <img
                                      key={`${review.id}-star-${starIndex}`}
                                      src="/images/specialist-profile/Star.svg"
                                      alt=""
                                      aria-hidden="true"
                                      className={
                                        starIndex < getRoundedRating(review.rating)
                                          ? styles.reviewStarIcon
                                          : styles.reviewStarIconInactive
                                      }
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className={styles.reviewMetaBlock}>
                                <div>
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
                              </div>

                              <p className={styles.reviewText}>{review.text}</p>
                            </div>

                            {review.specialistReply ? (
                              <div className={styles.replyCard}>
                                <span className={styles.reviewDate}>
                                  {formatDate(review.specialistReply.createdAt)}
                                </span>

                                <div className={styles.replyTitle}>Ответ специалиста</div>

                                <p className={styles.replyText}>
                                  {review.specialistReply.text}
                                </p>
                              </div>
                            ) : profile.isOwner ? (
                              <Link
                                className={styles.reviewReplyButton}
                                to={ownerWorkspace?.reviewsPath ?? '#'}
                              >
                                Ответить на отзыв
                              </Link>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>

                    {canLoadMoreReviews ? (
                      <button
                        type="button"
                        className={`${styles.secondaryButton} ${styles.reviewsLoadMoreButton}`}
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

              <div className={styles.galleryViewerContent}>
                <aside className={styles.galleryViewerThumbs}>
                  {galleryItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        index === activeGalleryIndex
                          ? `${styles.galleryViewerThumb} ${styles.galleryViewerThumbActive}`
                          : styles.galleryViewerThumb
                      }
                      onClick={() => setActiveGalleryIndex(index)}
                    >
                      <img src={item.imageUrl} alt={item.alt || `Фото ${index + 1}`} />
                    </button>
                  ))}
                </aside>

                <div className={styles.galleryViewerMain}>
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
                    {isEditingDetails ? (
                      <button
                        type="button"
                        className={styles.galleryViewerDelete}
                        onClick={handleRemoveGalleryImageFromViewer}
                      >
                        Удалить
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isEmailChangeModalOpen ? (
          <div
            className={styles.emailChangeModalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-change-title"
            onClick={onCloseEmailChangeModal}
          >
            <section
              className={styles.emailChangeModal}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.emailChangeModalClose}
                onClick={onCloseEmailChangeModal}
                aria-label="Закрыть окно подтверждения смены почты"
              >
                ✕
              </button>

              {emailChangeStep === 'success' ? (
                <>
                  <h3 id="email-change-title" className={styles.emailChangeModalTitle}>
                    Подтверждение смены почты
                  </h3>
                  <p className={styles.emailChangeModalText}>Почта успешно изменена!</p>
                  <div className={styles.emailChangeModalActions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={onCloseEmailChangeModal}
                    >
                      Закрыть
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 id="email-change-title" className={styles.emailChangeModalTitle}>
                    Подтверждение смены почты
                  </h3>
                  <p className={styles.emailChangeModalText}>
                    Код для смены почты был отправлен вам на почту
                    {pendingEmailChange ? ` ${pendingEmailChange}` : ''}.
                  </p>

                  <input
                    type="text"
                    className={styles.emailChangeCodeInput}
                    placeholder="Введите код"
                    value={emailChangeCodeInput}
                    onChange={(event) => onSetEmailChangeCodeInput(event.target.value)}
                  />

                  {emailChangeError ? (
                    <p className={styles.emailChangeModalError}>{emailChangeError}</p>
                  ) : null}

                  <div className={styles.emailChangeModalActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={onRequestEmailChangeCode}
                      disabled={isRequestingEmailChangeCode}
                    >
                      {isRequestingEmailChangeCode
                        ? 'Отправляем...'
                        : 'Отправить код повторно'}
                    </button>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={onConfirmEmailChangeCode}
                      disabled={isVerifyingEmailChangeCode}
                    >
                      {isVerifyingEmailChangeCode ? 'Проверяем...' : 'Подтвердить'}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : null}

        {isReviewViewerOpen && currentReviewPhoto ? (
          <div
            className={styles.galleryViewerOverlay}
            onClick={handleCloseReviewViewer}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фото отзыва"
          >
            <div
              className={styles.galleryViewerModal}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.galleryViewerClose}
                onClick={handleCloseReviewViewer}
                aria-label="Закрыть"
              >
                ✕
              </button>

              <div className={styles.galleryViewerContent}>
                <aside className={styles.galleryViewerThumbs}>
                  {activeReviewPhotos.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      className={
                        index === activeReviewPhotoIndex
                          ? `${styles.galleryViewerThumb} ${styles.galleryViewerThumbActive}`
                          : styles.galleryViewerThumb
                      }
                      onClick={() => setActiveReviewPhotoIndex(index)}
                    >
                      <img src={item} alt={`Фото отзыва ${index + 1}`} />
                    </button>
                  ))}
                </aside>

                <div className={styles.galleryViewerMain}>
                  <div className={styles.galleryViewerImageWrap}>
                    <img
                      className={styles.galleryViewerImage}
                      src={currentReviewPhoto}
                      alt="Фото отзыва"
                    />
                  </div>

                  <div className={styles.galleryViewerControls}>
                    <button
                      type="button"
                      className={styles.galleryViewerArrow}
                      disabled={!canPrevReviewPhoto}
                      onClick={handlePrevReviewPhoto}
                      aria-label="Предыдущее фото"
                    >
                      ←
                    </button>
                    <span className={styles.galleryViewerCounter}>
                      {(activeReviewPhotoIndex ?? 0) + 1} / {activeReviewPhotos.length}
                    </span>
                    <button
                      type="button"
                      className={styles.galleryViewerArrow}
                      disabled={!canNextReviewPhoto}
                      onClick={handleNextReviewPhoto}
                      aria-label="Следующее фото"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
