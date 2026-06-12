// /src/features/specialist-applications/ui/SpecialistApplicationsModerationSection.tsx
import { observer } from 'mobx-react-lite';
import { Fragment, useEffect, useRef, useSyncExternalStore } from 'react';

import { adminSpecialistsManagementStore } from '@/features/admin-specialists-management/model/adminSpecialistsManagementStore';
import { CreateSpecialistAccountModal } from '@/features/admin-specialists-management/ui/CreateSpecialistAccountModal';
import { authStore } from '@/features/auth';

import { AdminInterviewsCalendar } from './AdminInterviewsCalendar';
import styles from './SpecialistApplicationsModerationSection.module.css';
import { specialistApplicationsModerationStore } from '../model/specialistApplicationsModerationStore';
import {
  formatInterviewDateTimeLocalForDisplay,
  getMaxInterviewDateTimeLocalString,
  getMinInterviewDateTimeLocalString,
} from '../model/specialistApplicationsModerationValidation';
import { createEmptySpecialistApplicationQuestionnaire } from '../model/types';

import type { SpecialistApplicationsStatusFilter } from '../model/specialistApplicationsModerationStore';
import type {
  SpecialistApplication,
  SpecialistApplicationQuestionnaire,
} from '../model/types';
import type { ReactElement } from 'react';

const STATUS_FILTER_OPTIONS: {
  value: SpecialistApplicationsStatusFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'pending_review', label: 'На проверке' },
  { value: 'interview_assigned', label: 'Собеседование назначено' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
];

function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusLabel(application: SpecialistApplication): string {
  if (application.status === 'pending_review') {
    return 'Ждут проверки';
  }

  if (application.status === 'interview_assigned') {
    return 'Собеседование';
  }

  if (application.status === 'approved') {
    return 'Одобрено';
  }

  return 'Отклонено';
}

function getStatusClassName(
  application: SpecialistApplication,
  stylesMap: Record<string, string>,
): string {
  if (application.status === 'pending_review') {
    return stylesMap.statusPending;
  }

  if (application.status === 'interview_assigned') {
    return stylesMap.statusInterview;
  }

  if (application.status === 'approved') {
    return stylesMap.statusApproved;
  }

  return stylesMap.statusRejected;
}

function formatBoolean(value: boolean): string {
  return value ? 'Да' : 'Нет';
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '—';
}

function formatExperienceYears(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return `${value} ${value === 1 ? 'год' : value < 5 ? 'года' : 'лет'}`;
}

const CALENDAR_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 12H17V17H12V12ZM19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 5V7H5V5H19ZM5 19V9H19V19H5Z"
      fill="#211500"
      stroke="white"
      strokeWidth="0.3"
    />
  </svg>
);

type InterviewDateTimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function InterviewDateTimeField({
  value,
  onChange,
}: InterviewDateTimeFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (): void => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if ('showPicker' in input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // showPicker may throw if not triggered by user gesture in some browsers.
      }
    }

    input.click();
  };

  const displayValue = formatInterviewDateTimeLocalForDisplay(value);

  return (
    <div className={styles.dateTimeField}>
      <input
        ref={inputRef}
        className={styles.dateTimeInputNative}
        type="datetime-local"
        lang="ru"
        min={getMinInterviewDateTimeLocalString()}
        max={getMaxInterviewDateTimeLocalString()}
        value={value}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        className={`${styles.input} ${styles.dateTimeDisplay}`}
        type="text"
        lang="ru"
        readOnly
        value={displayValue}
        placeholder="дд.мм.гггг, чч:мм"
        aria-label="Дата и время собеседования"
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
      />
      <button
        type="button"
        className={styles.calendarButton}
        onClick={openPicker}
        aria-label="Открыть календарь"
      >
        {CALENDAR_ICON}
      </button>
    </div>
  );
}

type ApplicationInfoSectionsProps = {
  selected: SpecialistApplication;
  questionnaire: SpecialistApplicationQuestionnaire;
};

function ApplicationInfoSections({
  selected,
  questionnaire,
}: ApplicationInfoSectionsProps): ReactElement {
  return (
    <div className={styles.infoSections}>
      <section className={styles.infoSection}>
        <h3 className={styles.infoSectionTitle}>Заявка</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Город</span>
            <span className={styles.infoValue}>{selected.city}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Дата отправки</span>
            <span className={styles.infoValue}>{formatDate(selected.createdAt)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Собеседование</span>
            <span className={styles.infoValue}>
              {selected.interviewDate ? formatDate(selected.interviewDate) : '—'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Проверил</span>
            <span className={styles.infoValue}>{selected.reviewedBy || '—'}</span>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h3 className={styles.infoSectionTitle}>Аккаунт специалиста</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Кабинет специалиста</span>
            <span className={styles.infoValue}>
              {selected.specialistAccountCreatedAt
                ? `Создан ${formatDate(selected.specialistAccountCreatedAt)}`
                : 'Ещё не создан'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Specialist ID</span>
            <span className={styles.infoValue}>{selected.createdSpecialistId || '—'}</span>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h3 className={styles.infoSectionTitle}>Профиль</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Опыт</span>
            <span className={styles.infoValue}>
              {formatExperienceYears(questionnaire.experienceYears)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Животные</span>
            <span className={styles.infoValue}>{formatList(questionnaire.animalTypes)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Форматы услуг</span>
            <span className={styles.infoValue}>{formatList(questionnaire.serviceFormats)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Портфолио</span>
            <span className={styles.infoValue}>
              {questionnaire.portfolioUrl ? (
                <a href={questionnaire.portfolioUrl} target="_blank" rel="noreferrer">
                  Открыть ссылку
                </a>
              ) : (
                '—'
              )}
            </span>
          </div>
          <div className={`${styles.infoItem} ${styles.infoItemWide}`}>
            <span className={styles.infoLabel}>География выезда</span>
            <span className={styles.infoValue}>
              {questionnaire.districtPreferences || '—'}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h3 className={styles.infoSectionTitle}>Компетенции</h3>
        <div className={`${styles.infoGrid} ${styles.infoGridCompact}`}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Готов давать лекарства</span>
            <span className={styles.infoValue}>
              {formatBoolean(questionnaire.canGiveMedication)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Сложное поведение</span>
            <span className={styles.infoValue}>
              {formatBoolean(questionnaire.canHandleDifficultBehavior)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ночные заказы</span>
            <span className={styles.infoValue}>
              {formatBoolean(questionnaire.canTakeOvernightOrders)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Свои питомцы</span>
            <span className={styles.infoValue}>{formatBoolean(questionnaire.hasOwnPets)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>База первой помощи</span>
            <span className={styles.infoValue}>
              {formatBoolean(questionnaire.hasPetFirstAidBasics)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

type ApplicationDetailsCardProps = {
  selected: SpecialistApplication;
  questionnaire: SpecialistApplicationQuestionnaire;
  store: typeof specialistApplicationsModerationStore;
  reviewedBy: string;
  canCreateAccount: boolean;
  className: string;
};

function ApplicationDetailsCard({
  selected,
  questionnaire,
  store,
  reviewedBy,
  canCreateAccount,
  className,
}: ApplicationDetailsCardProps): ReactElement {
  return (
    <div className={className}>
      <div className={styles.detailsHeader}>
        <div>
          <h2 className={styles.detailsTitle}>{selected.fullName}</h2>
          <p className={styles.detailsSubtitle}>
            {selected.email}
            {'\n'}
            {selected.phone}
          </p>
        </div>

        <span className={getStatusClassName(selected, styles)}>
          {getStatusLabel(selected)}
        </span>
      </div>

      <ApplicationInfoSections selected={selected} questionnaire={questionnaire} />

      <div className={styles.aboutBlock}>
        <h3 className={styles.blockTitle}>О себе</h3>
        <p className={styles.aboutText}>{selected.about}</p>
      </div>
      <div className={styles.aboutBlock}>
        <h3 className={styles.blockTitle}>Условия работы</h3>
        <p className={styles.aboutText}>{questionnaire.housingType || '—'}</p>
      </div>
      <div className={styles.aboutBlock}>
        <h3 className={styles.blockTitle}>Предпочтительный график</h3>
        <p className={styles.aboutText}>{questionnaire.schedulePreferences || '—'}</p>
      </div>
      <div className={styles.aboutBlock}>
        <h3 className={styles.blockTitle}>Мотивация</h3>
        <p className={styles.aboutText}>{questionnaire.motivation || '—'}</p>
      </div>
      <div className={styles.aboutBlock}>
        <h3 className={styles.blockTitle}>Дополнительная информация</h3>
        <p className={styles.aboutText}>{questionnaire.additionalInfo || '—'}</p>
      </div>

      <div className={styles.formBlock}>
        <h3 className={styles.blockTitle}>Решение по заявке</h3>
        <p className={styles.formHints}>
          Собеседование — не раньше чем через час от текущего момента; у одного
          администратора слоты по 1 часу не должны пересекаться. При отклонении
          комментарий не короче 15 символов, с буквами и понятной причиной.
        </p>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Дата и время собеседования</span>
            <InterviewDateTimeField
              value={store.draft.interviewDate}
              onChange={(nextValue) => {
                store.setDraftField('interviewDate', nextValue);
              }}
            />
          </label>

          <label className={styles.fieldWide}>
            <span className={styles.fieldLabel}>Комментарий администратора</span>
            <textarea
              className={styles.textarea}
              value={store.draft.reviewComment}
              onChange={(event) => {
                store.setDraftField('reviewComment', event.target.value);
              }}
              placeholder="Например: уточнить опыт с крупными собаками или причину отклонения."
            />
          </label>
        </div>

        {store.actionError ? (
          <div className={styles.errorBanner}>{store.actionError}</div>
        ) : null}

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={store.isAssigningInterview}
            onClick={() => {
              void store.assignInterview(reviewedBy);
            }}
          >
            {store.isAssigningInterview ? 'Назначаем...' : 'Назначить собеседование'}
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={store.isApproving}
            onClick={() => {
              void store.approveSelected(reviewedBy);
            }}
          >
            {store.isApproving ? 'Одобряем...' : 'Одобрить'}
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            disabled={store.isRejecting}
            onClick={() => {
              void store.rejectSelected(reviewedBy);
            }}
          >
            {store.isRejecting ? 'Отклоняем...' : 'Отклонить'}
          </button>
          {canCreateAccount ? (
            <button
              className={styles.createAccountButton}
              type="button"
              onClick={() => {
                adminSpecialistsManagementStore.openForApplication(selected);
              }}
            >
              Создать кабинет специалиста
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const SpecialistApplicationsModerationSection = observer((): ReactElement => {
  const store = specialistApplicationsModerationStore;
  const authState = useSyncExternalStore(authStore.subscribe, authStore.getState);
  const reviewedBy = authState.user?.email ?? authState.user?.adminId ?? 'admin';

  useEffect(() => {
    void store.load();
  }, [store]);

  const selected = store.selectedApplication;
  const canCreateAccount = Boolean(
    selected && selected.status === 'approved' && !selected.specialistAccountCreatedAt,
  );

  const myScheduledInterviews = store.getScheduledInterviewsForReviewer(reviewedBy);
  const pendingReviewCount = store.sortedApplications.filter(
    (item) => item.status === 'pending_review',
  ).length;

  const questionnaire =
    selected?.questionnaire ?? createEmptySpecialistApplicationQuestionnaire();

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Модерация анкет специалистов</h1>
          <p className={styles.subtitle}>
            Заявки, отправленные с страницы “Стать специалистом”. Необходимо проверяет
            анкету, назначить собеседование, одобрить или отклонить заявку.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Ждут проверки</span>
            <span className={styles.statValue}>{pendingReviewCount}</span>
          </div>
        </div>
      </section>

      {!store.isLoading && !store.loadError ? (
        <div className={styles.calendarSection}>
          <AdminInterviewsCalendar interviews={myScheduledInterviews} />
        </div>
      ) : null}

      {store.isLoading ? (
        <div className={styles.stateCard}>Загрузка заявок...</div>
      ) : null}

      {!store.isLoading && store.loadError ? (
        <div className={styles.stateCard}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError ? (
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sectionTitle}>Очередь заявок</h2>
            </div>

            {store.applications.length > 0 ? (
              <>
                <div className={styles.filters}>
                  <label className={styles.searchField}>
                    <input
                      className={styles.searchInput}
                      type="search"
                      value={store.searchQuery}
                      onChange={(event) => {
                        store.setSearchQuery(event.target.value);
                      }}
                      placeholder="Поиск по имени, email, телефону, городу..."
                      autoComplete="off"
                    />
                  </label>

                  <label className={styles.filterField}>
                    <select
                      className={styles.filterSelect}
                      value={store.statusFilter}
                      onChange={(event) => {
                        store.setStatusFilter(
                          event.target.value as SpecialistApplicationsStatusFilter,
                        );
                      }}
                    >
                      {STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className={styles.filterHint}>
                  {store.filteredSortedApplications.length === store.applications.length
                    ? `Показано: ${store.applications.length} из ${store.applications.length}`
                    : `Показано: ${store.filteredSortedApplications.length} из ${store.applications.length}`}
                </p>
              </>
            ) : null}

            {store.applications.length === 0 ? (
              <div className={styles.emptyCard}>Пока нет новых заявок.</div>
            ) : store.filteredSortedApplications.length === 0 ? (
              <div className={styles.emptyCard}>
                Нет заявок по заданным условиям поиска и фильтра.
              </div>
            ) : (
              <div className={styles.applicationList}>
                {store.filteredSortedApplications.map((item) => (
                  <Fragment key={item.id}>
                    <button
                      type="button"
                      className={`${styles.applicationListItem} ${
                        selected?.id === item.id ? styles.applicationListItemActive : ''
                      }`}
                      onClick={() => {
                        store.toggleApplication(item.id);
                      }}
                    >
                      <div className={styles.applicationTop}>
                        <div className={styles.applicationDate}>
                          {formatDate(item.createdAt)}
                        </div>
                        <span className={getStatusClassName(item, styles)}>
                          {getStatusLabel(item)}
                        </span>
                      </div>

                      <div className={styles.applicationName}>{item.fullName}</div>
                      <div className={styles.applicationMeta}>{item.city}</div>
                    </button>

                    {selected?.id === item.id ? (
                      <ApplicationDetailsCard
                        selected={selected}
                        questionnaire={questionnaire}
                        store={store}
                        reviewedBy={reviewedBy}
                        canCreateAccount={canCreateAccount}
                        className={`${styles.detailsCard} ${styles.detailsCardInline}`}
                      />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            )}
          </aside>

          {!selected ? (
            <div className={styles.emptyCard}>Выбери заявку слева.</div>
          ) : (
            <div className={`${styles.detailsCard} ${styles.detailsCardStandalone}`}>
              <div className={styles.detailsHeader}>
                <div>
                  <h2 className={styles.detailsTitle}>{selected.fullName}</h2>
                  <p className={styles.detailsSubtitle}>
                    {selected.email}
                    {'\n'}
                    {selected.phone}
                  </p>
                </div>

                <span className={getStatusClassName(selected, styles)}>
                  {getStatusLabel(selected)}
                </span>
              </div>

              <ApplicationInfoSections
                selected={selected}
                questionnaire={questionnaire}
              />

              <div className={styles.aboutBlock}>
                <h3 className={styles.blockTitle}>О себе</h3>
                <p className={styles.aboutText}>{selected.about}</p>
              </div>

              <div className={styles.aboutBlock}>
                <h3 className={styles.blockTitle}>Условия работы</h3>
                <p className={styles.aboutText}>{questionnaire.housingType || '—'}</p>
              </div>

              <div className={styles.aboutBlock}>
                <h3 className={styles.blockTitle}>Предпочтительный график</h3>
                <p className={styles.aboutText}>
                  {questionnaire.schedulePreferences || '—'}
                </p>
              </div>

              <div className={styles.aboutBlock}>
                <h3 className={styles.blockTitle}>Мотивация</h3>
                <p className={styles.aboutText}>{questionnaire.motivation || '—'}</p>
              </div>

              <div className={styles.aboutBlock}>
                <h3 className={styles.blockTitle}>Дополнительная информация</h3>
                <p className={styles.aboutText}>{questionnaire.additionalInfo || '—'}</p>
              </div>

              <div className={styles.formBlock}>
                <h3 className={styles.blockTitle}>Решение по заявке</h3>

                <p className={styles.formHints}>
                  Собеседование — не раньше чем через час от текущего момента; у одного
                  администратора слоты по 1 часу не должны пересекаться. При отклонении
                  комментарий не короче 15 символов, с буквами и понятной причиной.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Дата и время собеседования</span>
                    <InterviewDateTimeField
                      value={store.draft.interviewDate}
                      onChange={(nextValue) => {
                        store.setDraftField('interviewDate', nextValue);
                      }}
                    />
                  </label>

                  <label className={styles.fieldWide}>
                    <span className={styles.fieldLabel}>Комментарий администратора</span>
                    <textarea
                      className={styles.textarea}
                      value={store.draft.reviewComment}
                      onChange={(event) => {
                        store.setDraftField('reviewComment', event.target.value);
                      }}
                      placeholder="Например: уточнить опыт с крупными собаками или причину отклонения."
                    />
                  </label>
                </div>

                {store.actionError ? (
                  <div className={styles.errorBanner}>{store.actionError}</div>
                ) : null}

                <div className={styles.actions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={store.isAssigningInterview}
                    onClick={() => {
                      void store.assignInterview(reviewedBy);
                    }}
                  >
                    {store.isAssigningInterview
                      ? 'Назначаем...'
                      : 'Назначить собеседование'}
                  </button>

                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={store.isApproving}
                    onClick={() => {
                      void store.approveSelected(reviewedBy);
                    }}
                  >
                    {store.isApproving ? 'Одобряем...' : 'Одобрить'}
                  </button>

                  <button
                    className={styles.dangerButton}
                    type="button"
                    disabled={store.isRejecting}
                    onClick={() => {
                      void store.rejectSelected(reviewedBy);
                    }}
                  >
                    {store.isRejecting ? 'Отклоняем...' : 'Отклонить'}
                  </button>

                  {canCreateAccount ? (
                    <button
                      className={styles.createAccountButton}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          adminSpecialistsManagementStore.openForApplication(selected);
                        }
                      }}
                    >
                      Создать кабинет специалиста
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <CreateSpecialistAccountModal
        reviewedBy={reviewedBy}
        onCreated={(result) => {
          if (selected) {
            store.patchCreatedSpecialistAccount({
              applicationId: selected.id,
              specialistId: result.specialistId,
              specialistSlug: result.specialistSlug,
            });
          }
        }}
      />
    </div>
  );
});
