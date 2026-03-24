// /src/features/specialist-applications/ui/SpecialistApplicationsModerationSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useSyncExternalStore } from 'react';

import { adminSpecialistsManagementStore } from '@/features/admin-specialists-management/model/adminSpecialistsManagementStore';
import { CreateSpecialistAccountModal } from '@/features/admin-specialists-management/ui/CreateSpecialistAccountModal';
import { authStore } from '@/features/auth';

import styles from './SpecialistApplicationsModerationSection.module.css';
import { specialistApplicationsModerationStore } from '../model/specialistApplicationsModerationStore';
import { createEmptySpecialistApplicationQuestionnaire } from '../model/types';

import type { SpecialistApplicationsStatusFilter } from '../model/specialistApplicationsModerationStore';
import type { SpecialistApplication } from '../model/types';
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
    return 'На проверке';
  }

  if (application.status === 'interview_assigned') {
    return 'Собеседование назначено';
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

  const questionnaire =
    selected?.questionnaire ?? createEmptySpecialistApplicationQuestionnaire();

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Админ-модерация</div>
          <h1 className={styles.title}>Анкеты специалистов</h1>
          <p className={styles.subtitle}>
            Здесь отображаются заявки, отправленные с публичной страницы “Стать
            специалистом”. Администратор проверяет анкету, назначает собеседование,
            одобряет или отклоняет заявку. Список можно сузить поиском и фильтром по
            статусу.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Активные</span>
            <span className={styles.statValue}>{store.pendingApplications.length}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Обработанные</span>
            <span className={styles.statValue}>{store.processedApplications.length}</span>
          </div>
        </div>
      </section>

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
                    <span className={styles.filterLabel}>Поиск</span>
                    <input
                      className={styles.searchInput}
                      type="search"
                      value={store.searchQuery}
                      onChange={(event) => {
                        store.setSearchQuery(event.target.value);
                      }}
                      placeholder="Имя, email, телефон, город…"
                      autoComplete="off"
                    />
                  </label>

                  <label className={styles.filterField}>
                    <span className={styles.filterLabel}>Статус</span>
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
                    ? `${store.applications.length} заявок`
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
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.applicationListItem} ${
                      selected?.id === item.id ? styles.applicationListItemActive : ''
                    }`}
                    onClick={() => {
                      store.selectApplication(item.id);
                    }}
                  >
                    <div className={styles.applicationTop}>
                      <div className={styles.applicationName}>{item.fullName}</div>
                      <span className={getStatusClassName(item, styles)}>
                        {getStatusLabel(item)}
                      </span>
                    </div>

                    <div className={styles.applicationMeta}>
                      {item.city} · {formatDate(item.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {!selected ? (
            <div className={styles.emptyCard}>Выбери заявку слева.</div>
          ) : (
            <div className={styles.detailsCard}>
              <div className={styles.detailsHeader}>
                <div>
                  <h2 className={styles.detailsTitle}>{selected.fullName}</h2>
                  <p className={styles.detailsSubtitle}>
                    {selected.email} · {selected.phone}
                  </p>
                </div>

                <span className={getStatusClassName(selected, styles)}>
                  {getStatusLabel(selected)}
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Город</span>
                  <span className={styles.infoValue}>{selected.city}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата отправки</span>
                  <span className={styles.infoValue}>
                    {formatDate(selected.createdAt)}
                  </span>
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
                  <span className={styles.infoValue}>
                    {selected.createdSpecialistId || '—'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Опыт</span>
                  <span className={styles.infoValue}>
                    {questionnaire.experienceYears || '—'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Животные</span>
                  <span className={styles.infoValue}>
                    {formatList(questionnaire.animalTypes)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Форматы услуг</span>
                  <span className={styles.infoValue}>
                    {formatList(questionnaire.serviceFormats)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Портфолио</span>
                  <span className={styles.infoValue}>
                    {questionnaire.portfolioUrl ? (
                      <a
                        href={questionnaire.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть ссылку
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>

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
                  <span className={styles.infoValue}>
                    {formatBoolean(questionnaire.hasOwnPets)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>База первой помощи</span>
                  <span className={styles.infoValue}>
                    {formatBoolean(questionnaire.hasPetFirstAidBasics)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>География выезда</span>
                  <span className={styles.infoValue}>
                    {questionnaire.districtPreferences || '—'}
                  </span>
                </div>
              </div>

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

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Дата и время собеседования</span>
                    <input
                      className={styles.input}
                      type="datetime-local"
                      value={store.draft.interviewDate}
                      onChange={(event) => {
                        store.setDraftField('interviewDate', event.target.value);
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
