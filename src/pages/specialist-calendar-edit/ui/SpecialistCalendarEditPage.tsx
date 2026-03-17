// src/pages/specialist-calendar-edit/ui/SpecialistCalendarEditPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
    buildCalendarMonthDays,
    CALENDAR_STATUS_LABELS,
    CALENDAR_WEEKDAY_LABELS,
    formatMonthLabel,
} from '@/features/specialist-profile/model/calendarUtils';
import { SpecialistCalendarEditStore } from '@/features/specialist-profile/model/specialistCalendarEditStore';

import styles from './SpecialistCalendarEditPage.module.css';

export const SpecialistCalendarEditPage = observer(() => {
    const { specialistSlug } = useParams<{ specialistSlug: string }>();
    const { isAuth, user } = useAuth();

    const store = useMemo(() => new SpecialistCalendarEditStore(), []);

    useEffect(() => {
        if (!specialistSlug) {
            return;
        }

        void store.load(specialistSlug);
    }, [specialistSlug, store, isAuth, user?.id, user?.role, user?.specialistSlug, user?.specialistId]);

    useEffect(() => {
        return () => {
            store.reset();
        };
    }, [store]);

    if (!specialistSlug) {
        return <Navigate to="/" replace />;
    }

    if (!isAuth || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'specialist') {
        return <Navigate to={`/specialists/${specialistSlug}`} replace />;
    }

    if (
        user.specialistSlug &&
        user.specialistSlug !== specialistSlug &&
        store.profile?.id !== user.specialistId
    ) {
        return <Navigate to={`/specialists/${specialistSlug}`} replace />;
    }

    if (store.profile && !store.profile.isOwner) {
        return <Navigate to={`/specialists/${specialistSlug}`} replace />;
    }

    if (store.isLoading) {
        return (
            <section className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.stateCard}>
                        <h1 className={styles.stateTitle}>Загрузка календаря</h1>
                        <p className={styles.stateText}>
                            Подготавливаем настройки доступности специалиста.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (store.error || !store.profile || !store.editableCalendar) {
        return (
            <section className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.stateCard}>
                        <h1 className={styles.stateTitle}>Не удалось открыть календарь</h1>
                        <p className={styles.stateText}>
                            {store.error ?? 'Профиль специалиста не найден.'}
                        </p>
                        <div className={styles.stateActions}>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => {
                                    void store.load(specialistSlug);
                                }}
                            >
                                Попробовать снова
                            </button>

                            <Link
                                to={`/specialists/${specialistSlug}`}
                                className={styles.secondaryLink}
                            >
                                Вернуться в профиль
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const calendarMonth = buildCalendarMonthDays(
        store.currentMonth,
        store.editableCalendar,
    );

    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>Календарь специалиста</span>
                        <h1 className={styles.title}>Редактирование доступности</h1>
                        <p className={styles.description}>
                            Можно выбрать один день или сразу несколько дней и назначить им
                            общий статус.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <Link
                            to={`/specialists/${store.profile.slug}`}
                            className={styles.secondaryLink}
                        >
                            Назад в профиль
                        </Link>


                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => {
                                void store.save();
                            }}
                            disabled={store.isSaving}
                        >
                            {store.isSaving ? 'Сохранение...' : 'Сохранить календарь'}
                        </button>
                    </div>
                </header>

                {store.hasUnsavedChanges ? (
                    <div className={styles.warningBanner}>
                        Есть несохранённые изменения. Они попадут в профиль после нажатия
                        кнопки «Сохранить календарь».
                    </div>
                ) : null}

                {store.saveError ? (
                    <div className={styles.errorBanner}>{store.saveError}</div>
                ) : null}

                {store.saveSuccess ? (
                    <div className={styles.successBanner}>Календарь успешно сохранён.</div>
                ) : null}

                <div className={styles.layout}>
                    <div className={styles.leftColumn}>
                        <div className={styles.panel}>
                            <div className={styles.monthHeader}>
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={store.goToPreviousMonth}
                                >
                                    ←
                                </button>

                                <div className={styles.monthTitle}>
                                    {formatMonthLabel(store.currentMonth)}
                                </div>

                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={store.goToNextMonth}
                                >
                                    →
                                </button>
                            </div>

                            <div className={styles.selectionToolbar}>
                                <label className={styles.multiSelectToggle}>
                                    <input
                                        type="checkbox"
                                        checked={store.isMultiSelectMode}
                                        onChange={(event) =>
                                            store.setMultiSelectMode(event.target.checked)
                                        }
                                    />
                                    <span>Множественный выбор дат</span>
                                </label>

                                {store.isMultiSelectMode ? (
                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={store.clearSelectedDates}
                                    >
                                        Очистить выбор
                                    </button>
                                ) : null}
                            </div>

                            <div className={styles.weekdays}>
                                {CALENDAR_WEEKDAY_LABELS.map((weekday) => (
                                    <span key={weekday} className={styles.weekday}>
                                        {weekday}
                                    </span>
                                ))}
                            </div>

                            <div className={styles.daysGrid}>
                                {calendarMonth.days.map((day, index) => {
                                    const isSelected =
                                        day.isoDate ? store.isDateSelected(day.isoDate) : false;


                                    return (
                                        <button
                                            key={day.isoDate ?? `empty-${index}`}
                                            type="button"
                                            className={`${styles.dayButton} ${day.isoDate ? styles.dayButtonActive : styles.dayButtonEmpty
                                                } ${isSelected ? styles.dayButtonSelected : ''} ${day.status === 'day_off'
                                                    ? styles.dayOff
                                                    : day.status === 'fully_booked'
                                                        ? styles.fullyBooked
                                                        : day.status === 'partially_booked'
                                                            ? styles.partiallyBooked
                                                            : ''
                                                }`}
                                            disabled={!day.isoDate}
                                            onClick={() => {
                                                if (day.isoDate) {
                                                    store.selectDate(day.isoDate);
                                                }
                                            }}
                                        >
                                            {day.dayNumber ? (
                                                <>
                                                    <span className={styles.dayNumber}>{day.dayNumber}</span>
                                                    {day.status && day.status !== 'available' ? (
                                                        <span className={styles.dayDot} />
                                                    ) : null}
                                                </>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.legend}>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendMark} ${styles.legendFree}`} />
                                    <span>{CALENDAR_STATUS_LABELS.available}</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span
                                        className={`${styles.legendMark} ${styles.legendPartial}`}
                                    />
                                    <span>{CALENDAR_STATUS_LABELS.partially_booked}</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendMark} ${styles.legendFull}`} />
                                    <span>{CALENDAR_STATUS_LABELS.fully_booked}</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendMark} ${styles.legendDayOff}`} />
                                    <span>{CALENDAR_STATUS_LABELS.day_off}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className={styles.rightColumn}>
                        <div className={styles.selectedDateCard}>
                            <span className={styles.selectedDateCaption}>
                                {store.selectedDatesCount > 1 ? 'Выбранные даты' : 'Выбранная дата'}
                            </span>
                            <div className={styles.selectedDateValue}>
                                {store.selectedDatesLabel}
                            </div>
                            <div className={styles.selectedDateMeta}>
                                <span className={styles.metaChip}>
                                    Текущий статус активной даты:{' '}
                                    {CALENDAR_STATUS_LABELS[store.selectedDateActualStatus]}
                                </span>
                                <span className={styles.metaChip}>
                                    Активная дата: {store.selectedDate}
                                </span>
                            </div>
                        </div>

                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>1. Режим дня</h2>
                            <p className={styles.panelDescription}>
                                Выбери статус и примени его к одной активной дате или ко всем
                                выбранным датам.
                            </p>

                            <div className={styles.statusCards}>
                                <button
                                    type="button"
                                    className={`${styles.statusCard} ${store.selectedStatus === 'available' ? styles.statusCardActive : ''
                                        }`}
                                    onClick={() => store.setSelectedStatus('available')}
                                >
                                    <span className={`${styles.statusPreview} ${styles.legendFree}`} />
                                    <span className={styles.statusTitle}>
                                        {CALENDAR_STATUS_LABELS.available}
                                    </span>
                                    <span className={styles.statusText}>
                                        День полностью открыт для записи.
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.statusCard} ${store.selectedStatus === 'fully_booked'
                                        ? styles.statusCardActive
                                        : ''
                                        }`}
                                    onClick={() => store.setSelectedStatus('fully_booked')}
                                >
                                    <span className={`${styles.statusPreview} ${styles.legendFull}`} />
                                    <span className={styles.statusTitle}>
                                        {CALENDAR_STATUS_LABELS.fully_booked}
                                    </span>
                                    <span className={styles.statusText}>
                                        Новые записи на этот день невозможны.
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.statusCard} ${store.selectedStatus === 'day_off' ? styles.statusCardActive : ''
                                        }`}
                                    onClick={() => store.setSelectedStatus('day_off')}
                                >
                                    <span className={`${styles.statusPreview} ${styles.legendDayOff}`} />
                                    <span className={styles.statusTitle}>
                                        {CALENDAR_STATUS_LABELS.day_off}
                                    </span>
                                    <span className={styles.statusText}>
                                        Это выходной день, записи закрыты полностью.
                                    </span>
                                </button>
                            </div>

                            <div className={styles.inlineActions}>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={store.applySelectedDayStatus}
                                    disabled={!store.canApplySelectedStatus}
                                >
                                    {store.selectedDatesCount > 1
                                        ? `Применить статус к ${store.selectedDatesCount} дням`
                                        : `Применить статус к ${store.selectedDateLabel}`}
                                </button>

                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={store.clearSelectedDayStatus}
                                >
                                    {store.selectedDatesCount > 1
                                        ? 'Сбросить ручной статус у выбранных дней'
                                        : 'Сбросить ручной статус'}
                                </button>
                            </div>

                            <div className={styles.note}>
                                В режиме множественного выбора кликай по датам в календаре, чтобы
                                добавить или убрать их из набора. Частичная доступность ниже
                                настраивается только для одной активной даты.
                            </div>
                        </div>

                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>2. Частичная доступность</h2>
                            <p className={styles.panelDescription}>
                                Этот блок всегда относится только к активной дате{' '}
                                <strong>{store.selectedDateLabel}</strong>.
                            </p>

                            <div className={styles.selectedDateInline}>
                                Настраиваемая дата: <strong>{store.selectedDate}</strong>
                            </div>


                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>С</span>
                                    <input
                                        className={styles.input}
                                        type="time"
                                        value={store.windowForm.startTime}
                                        onChange={(event) =>
                                            store.setWindowField('startTime', event.target.value)
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>До</span>
                                    <input
                                        className={styles.input}
                                        type="time"
                                        value={store.windowForm.endTime}
                                        onChange={(event) =>
                                            store.setWindowField('endTime', event.target.value)
                                        }
                                    />
                                </label>
                            </div>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Комментарий</span>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={store.windowForm.comment}
                                    onChange={(event) =>
                                        store.setWindowField('comment', event.target.value)
                                    }
                                    placeholder="Например: только вечерние выгулы"
                                />
                            </label>

                            <div className={styles.field}>
                                <span className={styles.fieldLabel}>Какие услуги доступны</span>
                                <div className={styles.servicesList}>
                                    {store.services.map((service) => {
                                        const isChecked = store.windowForm.serviceIds.includes(
                                            service.id,
                                        );

                                        return (
                                            <label key={service.id} className={styles.checkboxCard}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => store.toggleWindowService(service.id)}
                                                />
                                                <span>{service.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {store.windowFormError ? (
                                <div className={styles.fieldError}>{store.windowFormError}</div>
                            ) : null}

                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={store.addAvailabilityWindow}
                            >
                                Добавить частичную доступность для {store.selectedDateLabel}
                            </button>

                            <div className={styles.windowsList}>
                                {store.selectedDateAvailabilityWindows.length > 0 ? (
                                    store.selectedDateAvailabilityWindows.map((item) => {
                                        const serviceLabels = store.services
                                            .filter((service) => item.serviceIds.includes(service.id))
                                            .map((service) => service.name);

                                        return (
                                            <div key={item.id} className={styles.windowCard}>
                                                <div className={styles.windowHeader}>
                                                    <strong>
                                                        {item.startTime} — {item.endTime}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className={styles.removeButton}
                                                        onClick={() => store.removeAvailabilityWindow(item.id)}
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>

                                                <div className={styles.windowServices}>
                                                    {serviceLabels.join(', ')}
                                                </div>


                                                {item.comment ? (
                                                    <div className={styles.windowComment}>{item.comment}</div>
                                                ) : null}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={styles.emptyState}>
                                        Для даты {store.selectedDateLabel} частичная доступность пока не
                                        настроена.
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
});