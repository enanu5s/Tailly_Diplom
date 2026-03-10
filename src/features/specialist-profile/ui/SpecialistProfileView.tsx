// src/features/specialist-profile/ui/SpecialistProfileView.tsx

import { useMemo } from 'react';

import {
    SPECIALIST_CHILDREN_POLICY_LABELS,
    SPECIALIST_HOUSING_TYPE_LABELS,
    SPECIALIST_PET_AGE_LABELS,
    SPECIALIST_PET_SIZE_LABELS,
    SPECIALIST_PET_TYPE_LABELS,
    SPECIALIST_SERVICE_PRICE_UNIT_LABELS,
} from '../model/constants';
import type {
    SpecialistGalleryItem,
    SpecialistProfile,
    SpecialistReview,
} from '../model/types';

import styles from './SpecialistProfileView.module.css';

type Props = {
    profile: SpecialistProfile | null;
    isLoading: boolean;
    error: string | null;
    visibleReviews: SpecialistReview[];
    canLoadMoreReviews: boolean;
    onRetry: () => void;
    onLoadMoreReviews: () => void;
};

type CalendarDay = {
    isoDate: string | null;
    dayNumber: number | null;
    isBooked: boolean;
    isCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function formatSpecialistName(profile: SpecialistProfile): string {
    return `${profile.main.firstName} ${profile.main.lastName}`.trim();
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

function getRatingStars(rating: number): string {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));

    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function buildCalendarDays(bookedDates: string[]): {
    monthLabel: string;
    days: CalendarDay[];
} {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const jsWeekday = firstDayOfMonth.getDay();
    const mondayFirstOffset = jsWeekday === 0 ? 6 : jsWeekday - 1;

    const bookedSet = new Set(bookedDates);
    const days: CalendarDay[] = [];

    for (let index = 0; index < mondayFirstOffset; index += 1) {
        days.push({
            isoDate: null,
            dayNumber: null,
            isBooked: false,
            isCurrentMonth: false,
        });
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
        const isoDate = new Date(year, monthIndex, dayNumber).toISOString().slice(0, 10);

        days.push({
            isoDate,
            dayNumber,
            isBooked: bookedSet.has(isoDate),
            isCurrentMonth: true,
        });
    }

    while (days.length % 7 !== 0) {
        days.push({
            isoDate: null,
            dayNumber: null,
            isBooked: false,
            isCurrentMonth: false,
        });
    }

    const monthLabel = new Intl.DateTimeFormat('ru-RU', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(year, monthIndex, 1));

    return {
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        days,
    };
}

function renderGalleryItem(item: SpecialistGalleryItem) {
    return (
        <div key={item.id} className={styles.galleryItem}>
            <img className={styles.galleryImage} src={item.imageUrl} alt={item.alt} />
        </div>
    );
}

export const SpecialistProfileView = ({
    profile,
    isLoading,
    error,
    visibleReviews,
    canLoadMoreReviews,
    onRetry,
    onLoadMoreReviews,
}: Props) => {
    const calendar = useMemo(() => {
        if (!profile) {
            return {
                monthLabel: '',
                days: [] as CalendarDay[],
            };
        }

        return buildCalendarDays(profile.calendar.bookedDates);
    }, [profile]);

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

    return (
        <div className={styles.layout}>
            <div className={styles.leftColumn}>
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Основные данные</h2>

                        {profile.isOwner ? (
                            <button type="button" className={styles.secondaryButton}>
                                Редактировать основные данные
                            </button>
                        ) : null}
                    </div>

                    <div className={styles.mainInfo}>
                        <div className={styles.avatarWrap}>
                            {profile.main.avatarUrl ? (
                                <img
                                    className={styles.avatar}
                                    src={profile.main.avatarUrl}
                                    alt={formatSpecialistName(profile)}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {profile.main.firstName.charAt(0)}
                                    {profile.main.lastName.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className={styles.mainInfoBody}>
                            <h1 className={styles.specialistName}>{formatSpecialistName(profile)}</h1>

                            <ul className={styles.metaList}>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Город</span>
                                    <span className={styles.metaValue}>{profile.main.city}</span>
                                </li>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Район</span>
                                    <span className={styles.metaValue}>{profile.main.district}</span>
                                </li>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Телефон</span>
                                    <a className={styles.metaValueLink} href={`tel:${profile.main.phone}`}>
                                        {formatPhone(profile.main.phone)}
                                    </a>
                                </li>
                                <li className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Email</span>
                                    <a className={styles.metaValueLink} href={`mailto:${profile.main.email}`}>
                                        {profile.main.email}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section >

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Календарь и рейтинг</h2>

                        {profile.isOwner ? (
                            <button type="button" className={styles.secondaryButton}>
                                Редактировать календарь
                            </button>
                        ) : null}
                    </div>

                    <div className={styles.calendarSection}>
                        <div className={styles.calendarHead}>
                            <div className={styles.calendarMonth}>{calendar.monthLabel}</div>
                            <div className={styles.calendarLegend}>
                                <span className={styles.legendDot} />
                                <span>Есть заказы</span>
                            </div>
                        </div>

                        <div className={styles.calendarGrid}>
                            {WEEKDAY_LABELS.map((weekday) => (
                                <div key={weekday} className={styles.calendarWeekday}>
                                    {weekday}
                                </div>
                            ))}
                            {calendar.days.map((day, index) => (
                                <div
                                    key={day.isoDate ?? `empty-${index}`}
                                    className={[
                                        styles.calendarCell,
                                        !day.isCurrentMonth ? styles.calendarCellEmpty : '',
                                        day.isBooked ? styles.calendarCellBooked : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {day.dayNumber ? (
                                        <>
                                            <span className={styles.calendarCellNumber}>{day.dayNumber}</span>
                                            {day.isBooked ? <span className={styles.calendarCellMarker} /> : null}
                                        </>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.badgesColumn}>
                        <div className={styles.infoBadge}>
                            <span className={styles.infoBadgeLabel}>Опыт ухода за питомцами</span>
                            <span className={styles.infoBadgeValue}>
                                {profile.stats.experienceYears} лет
                            </span>
                        </div>

                        <div className={styles.ratingCard}>
                            <div className={styles.ratingTop}>
                                <div>
                                    <div className={styles.ratingValue}>{profile.stats.rating.toFixed(2)}</div>
                                    <div className={styles.ratingStars}>
                                        {getRatingStars(profile.stats.rating)}
                                    </div>
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
                                    <span className={styles.statNumber}>
                                        {profile.stats.completedOrdersCount}
                                    </span>
                                    <span className={styles.statLabel}>выполненных заказов</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{profile.stats.repeatOrdersCount}</span>
                                    <span className={styles.statLabel}>повторных заказов</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Фотографии питомцев клиентов</h2>
                    </div>

                    {profile.petGallery.length > 0 ? (
                        <div className={styles.galleryGrid}>
                            {profile.petGallery.map(renderGalleryItem)}
                        </div>
                    ) : (
                        <p className={styles.emptyText}>Пока фотографий нет.</p>
                    )}
                </section>
            </div >

            <div className={styles.rightColumn}>
                <section className={styles.cardLarge}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Детали</h2>

                        {profile.isOwner ? (
                            <button type="button" className={styles.secondaryButton}>
                                Редактировать
                            </button>
                        ) : null}
                    </div>

                    <div className={styles.detailsSection}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Опыт ухода за питомцами</span>
                            <span className={styles.detailValue}>{profile.details.experienceLabel}</span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Тип жилья</span>
                            <span className={styles.detailValue}>
                                {SPECIALIST_HOUSING_TYPE_LABELS[profile.details.housingType]}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Размер питомцев</span>
                            <span className={styles.detailValue}>
                                {profile.details.petSizes
                                    .map((size) => SPECIALIST_PET_SIZE_LABELS[size])
                                    .join(', ')}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Возраст питомцев</span>
                            <span className={styles.detailValue}>
                                {profile.details.petAges
                                    .map((age) => SPECIALIST_PET_AGE_LABELS[age])
                                    .join(', ')}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Дети до 10 лет рядом</span>
                            <span className={styles.detailValue}>
                                {
                                    SPECIALIST_CHILDREN_POLICY_LABELS[
                                    profile.details.hasChildrenUnderTen
                                    ]
                                }
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Типы питомцев</span>
                            <span className={styles.detailValue}>
                                {profile.details.petTypes
                                    .map((petType) => SPECIALIST_PET_TYPE_LABELS[petType])
                                    .join(', ')}
                            </span>
                        </div>
                    </div>

                    <div className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Преимущества</h3>

                        <div className={styles.tags}>
                            {profile.details.advantages.map((advantage) => (
                                <span key={advantage.id} className={styles.tag}>
                                    {advantage.title}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Услуги</h3>

                        <div className={styles.servicesList}>
                            {profile.services.map((service) => (
                                <article key={service.id} className={styles.serviceCard}>
                                    <div className={styles.serviceTop}>
                                        <h4 className={styles.serviceName}>{service.name}</h4>
                                        <div className={styles.servicePrice}>
                                            {service.price > 0
                                                ? `${formatPrice(service.price)} ₽`
                                                : 'Бесплатно'}
                                        </div>
                                    </div>

                                    <div className={styles.serviceMeta}>
                                        <span>{service.locationLabel}</span>
                                        <span>
                                            {SPECIALIST_SERVICE_PRICE_UNIT_LABELS[service.priceUnit]}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Обо мне</h3>

                        <div className={styles.aboutText}>
                            {profile.details.about.split('\n').map((paragraph, index) => (
                                <p key={`${paragraph}-${index}`} className={styles.aboutParagraph}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

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
};