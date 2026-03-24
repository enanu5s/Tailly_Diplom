import styles from './ReviewsFiltersToolbar.module.css';

import type { ReactElement } from 'react';

import type {
  SpecialistReviewsRatingFilter,
  SpecialistReviewsReplyFilter,
} from '../../model/types';

type Props = {
  searchQuery: string;
  ratingFilter: SpecialistReviewsRatingFilter;
  replyFilter: SpecialistReviewsReplyFilter;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onRatingFilterChange: (value: SpecialistReviewsRatingFilter) => void;
  onReplyFilterChange: (value: SpecialistReviewsReplyFilter) => void;
};

export function ReviewsFiltersToolbar({
  searchQuery,
  ratingFilter,
  replyFilter,
  totalCount,
  filteredCount,
  onSearchChange,
  onRatingFilterChange,
  onReplyFilterChange,
}: Props): ReactElement {
  const ratingSelectValue =
    ratingFilter === 'all' ? 'all' : String(ratingFilter);

  const handleRatingChange = (value: string): void => {
    if (value === 'all') {
      onRatingFilterChange('all');
      return;
    }

    const n = Number(value);

    if (n >= 1 && n <= 5) {
      onRatingFilterChange(n as Exclude<SpecialistReviewsRatingFilter, 'all'>);
    }
  };

  return (
    <div className={styles.toolbar}>
      <label className={styles.searchLabel}>
        <span className={styles.searchLabelText}>Поиск по отзывам</span>
        <input
          type="search"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Имя, питомец, услуга, текст…"
          autoComplete="off"
        />
      </label>

      <div className={styles.filtersRow}>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Оценка</span>
          <select
            className={styles.select}
            value={ratingSelectValue}
            onChange={(e) => handleRatingChange(e.target.value)}
          >
            <option value="all">Все оценки</option>
            <option value="5">5 звёзд</option>
            <option value="4">4 звезды</option>
            <option value="3">3 звезды</option>
            <option value="2">2 звезды</option>
            <option value="1">1 звезда</option>
          </select>
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Ответ специалиста</span>
          <select
            className={styles.select}
            value={replyFilter}
            onChange={(e) =>
              onReplyFilterChange(e.target.value as SpecialistReviewsReplyFilter)
            }
          >
            <option value="all">Все отзывы</option>
            <option value="with_reply">С ответом</option>
            <option value="without_reply">Без ответа</option>
          </select>
        </label>
      </div>

      <p className={styles.hint} role="status">
        {totalCount === 0
          ? 'Отзывов пока нет.'
          : filteredCount === totalCount
            ? `Всего отзывов: ${totalCount}`
            : `Показано: ${filteredCount} из ${totalCount}`}
      </p>
    </div>
  );
}
