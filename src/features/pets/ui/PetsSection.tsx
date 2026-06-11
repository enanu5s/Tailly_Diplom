//src/features/pets/ui/PetsSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, type ChangeEvent, type ReactElement } from 'react';

import styles from './PetsSection.module.css';
import { petsStore } from '../model/petsStore';

import {
  PET_SIZE_LABELS,
  PET_TYPE_SHORT_LABELS,
  PET_TYPES,
  PET_WEIGHT_SIZES,
} from '../model/constants';
import type {
  PetAttitude,
  PetGender,
  PetHomeAlone,
  PetType,
  PetVaccinated,
} from '../model/types';

const PET_GENDER_LABELS: Record<PetGender, string> = {
  male: 'Самец',
  female: 'Самка',
};

const PET_ATTITUDE_LABELS: Record<PetAttitude, string> = {
  friendly: 'Дружелюбно',
  neutral: 'Нейтрально',
  aggressive: 'Агрессивно',
  unknown: 'Неизвестно',
};

const PET_HOME_ALONE_LABELS: Record<PetHomeAlone, string> = {
  ok: 'Спокойно',
  not_ok: 'Плохо переносит',
  unknown: 'Неизвестно',
};

const PET_VACCINATED_LABELS: Record<PetVaccinated, string> = {
  yes: 'Да',
  no: 'Нет',
  unknown: 'Неизвестно',
};

export const PetsSection = observer((): ReactElement => {
  useEffect(() => {
    if (!petsStore.loading && petsStore.pets.length === 0) {
      void petsStore.load();
    }
  }, []);

  const isCreatingNew = !!petsStore.draft && !petsStore.editingId;

  return (
    <section className={styles.section}>
      <div className={styles.headRow}>
        <h2 className={styles.title}>Мои питомцы</h2>

        <button
          className={styles.addBtn}
          type="button"
          onClick={() => petsStore.startAdd()}
          disabled={isCreatingNew || petsStore.saveLoading}
        >
          <span className={styles.addIcon}>+</span>
          <span>Добавить</span>
        </button>
      </div>

      {petsStore.error && <div className={styles.error}>{petsStore.error}</div>}

      {petsStore.loading && petsStore.pets.length === 0 && (
        <div className={styles.state}>Загружаем питомцев...</div>
      )}

      <div className={styles.list}>
        {/* Форма создания нового питомца */}
        {isCreatingNew && <PetCard isNew />}

        {/* Существующие питомцы */}
        {petsStore.pets.map((pet) => (
          <PetCard key={pet.id} id={pet.id} />
        ))}
      </div>
    </section>
  );
});

const PetCard = observer(
  ({ id, isNew = false }: { id?: string; isNew?: boolean }): ReactElement | null => {
    const isEditing = isNew || petsStore.editingId === id;

    const pet = isNew ? null : petsStore.pets.find((p) => p.id === id);
    const draft = petsStore.draft;

    // При редактировании или создании — используем draft для live-обновления
    const view = isEditing && draft ? draft : pet;

    if (!view) return null;

    const breeds = petsStore.getBreedsForType(
      isEditing && draft ? (draft.type ?? null) : (view.type ?? null),
    );

    const breedTitle = view.breedId
      ? (petsStore.breeds.find((b) => String(b.id) === String(view.breedId))?.title ??
        '—')
      : '—';

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) {
        petsStore.setDraftPhotoFromFile(file);
        event.target.value = '';
      }
    };

    const expandId = isNew ? 'new' : id || '';
    const isExpanded = petsStore.expanded.has(expandId);

    const typeLabel = view.type ? PET_TYPE_SHORT_LABELS[view.type] : '—';
    const sizeLabel = view.size ? PET_SIZE_LABELS[view.size] : '—';
    const cardClassName = [
      styles.card,
      isEditing ? styles.cardEditing : '',
      !isEditing && isExpanded ? styles.cardExpanded : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <article className={cardClassName}>
        {isEditing ? (
          <div className={styles.cardTop}>
            <div className={styles.photoCol}>
              <div className={styles.photoWrap}>
                {view.photoUrl ? (
                  <img
                    className={styles.photo}
                    src={view.photoUrl}
                    alt={view.name || 'Питомец'}
                  />
                ) : (
                  <div className={styles.photoPlaceholder}>Фото</div>
                )}
              </div>

              <label className={styles.photoBtn}>
                Загрузить
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <div className={styles.mainCol}>
              <Field
                label="Кличка"
                value={view.name}
                editable
                onChange={(value) => petsStore.setDraft('name', value)}
              />

              <div className={styles.row2}>
                <SelectField
                  label="Тип"
                  value={view.type ?? ''}
                  editable
                  options={[
                    ['', 'Не выбран'],
                    ...PET_TYPES.map((t) => [t, PET_TYPE_SHORT_LABELS[t]] as [string, string]),
                  ]}
                  onChange={(value) =>
                    petsStore.setDraft('type', (value || null) as PetType | null)
                  }
                />

                <div className={styles.field}>
                  <div className={styles.label}>Возраст</div>
                  <div className={styles.ageRow}>
                    <label className={styles.ageField}>
                      <span>Годы</span>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        value={String(view.ageYears)}
                        onChange={(e) =>
                          petsStore.setDraft('ageYears', Number(e.target.value || 0))
                        }
                        placeholder="годы"
                      />
                    </label>
                    <label className={styles.ageField}>
                      <span>Месяцы</span>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        max={11}
                        value={String(view.ageMonths)}
                        onChange={(e) =>
                          petsStore.setDraft('ageMonths', Number(e.target.value || 0))
                        }
                        placeholder="мес"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <div className={styles.label}>Порода:</div>
                  <select
                    className={styles.select}
                    value={view.breedId ?? ''}
                    onChange={(e) => petsStore.setBreed(e.target.value || null)}
                  >
                    <option value="">Не выбрано</option>
                    {breeds.map((breed) => (
                      <option key={breed.id} value={breed.id}>
                        {breed.title}
                      </option>
                    ))}
                  </select>
                </div>

                <SelectField
                  label="Масса:"
                  value={view.size ?? ''}
                  editable
                  options={[
                    ['', 'Не выбран'],
                    ...PET_WEIGHT_SIZES.map((s) => [s, PET_SIZE_LABELS[s]] as [string, string]),
                  ]}
                  onChange={(value) => petsStore.setDraft('size', (value || null) as any)}
                />
              </div>

              <button
                className={styles.editDetailsLink}
                type="button"
                onClick={() => petsStore.toggleExpand(expandId)}
              >
                Подробная информация
                <img
                  className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
                  src="/icons/chevron.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>

              {isExpanded ? (
                <div className={styles.extra}>
                  <div className={styles.extraGrid}>
                    <SelectField
                      label="Пол"
                      value={view.gender ?? ''}
                      editable
                      options={[
                        ['', 'Не указан'],
                        ['male', 'Самец'],
                        ['female', 'Самка'],
                      ]}
                      onChange={(value) =>
                        petsStore.setDraft('gender', (value || null) as PetGender | null)
                      }
                    />

                    <SelectField
                      label="Отношение к другим питомцам"
                      value={view.toOtherPets ?? ''}
                      editable
                      options={[
                        ['', 'Не указано'],
                        ['friendly', 'Дружелюбно'],
                        ['neutral', 'Нейтрально'],
                        ['aggressive', 'Агрессивно'],
                        ['unknown', 'Неизвестно'],
                      ]}
                      onChange={(value) =>
                        petsStore.setDraft('toOtherPets', (value || null) as PetAttitude | null)
                      }
                    />

                    <SelectField
                      label="Отношение к детям до 10 лет"
                      value={view.toKidsUnder10 ?? ''}
                      editable
                      options={[
                        ['', 'Не указано'],
                        ['friendly', 'Дружелюбно'],
                        ['neutral', 'Нейтрально'],
                        ['aggressive', 'Агрессивно'],
                        ['unknown', 'Неизвестно'],
                      ]}
                      onChange={(value) =>
                        petsStore.setDraft(
                          'toKidsUnder10',
                          (value || null) as PetAttitude | null,
                        )
                      }
                    />

                    <SelectField
                      label="Остаётся один дома"
                      value={view.staysHomeAlone ?? ''}
                      editable
                      options={[
                        ['', 'Не указано'],
                        ['ok', 'Спокойно'],
                        ['not_ok', 'Плохо переносит'],
                        ['unknown', 'Неизвестно'],
                      ]}
                      onChange={(value) =>
                        petsStore.setDraft(
                          'staysHomeAlone',
                          (value || null) as PetHomeAlone | null,
                        )
                      }
                    />

                    <SelectField
                      label="Вакцинация"
                      value={view.vaccinated ?? ''}
                      editable
                      options={[
                        ['', 'Не указано'],
                        ['yes', 'Да'],
                        ['no', 'Нет'],
                        ['unknown', 'Неизвестно'],
                      ]}
                      onChange={(value) =>
                        petsStore.setDraft('vaccinated', (value || null) as PetVaccinated | null)
                      }
                    />
                  </div>

                  <div className={styles.notesRow}>
                    <div className={styles.label}>Другие рекомендации</div>
                    <textarea
                      className={styles.textarea}
                      value={view.notes}
                      onChange={(e) => petsStore.setDraft('notes', e.target.value)}
                      placeholder="Например: особенности кормления, страхи, любимые игрушки..."
                      rows={4}
                    />
                  </div>
                </div>
              ) : null}

              <div className={styles.actions}>
                {petsStore.saveError && <div className={styles.error}>{petsStore.saveError}</div>}

                <button
                  className={styles.saveBtn}
                  type="button"
                  disabled={petsStore.saveLoading}
                  onClick={() => void petsStore.save()}
                >
                  {petsStore.saveLoading ? 'Сохраняем...' : 'Сохранить'}
                </button>

                <button
                  className={styles.cancelBtn}
                  type="button"
                  disabled={petsStore.saveLoading}
                  onClick={() => petsStore.cancelEdit()}
                >
                  Отмена
                </button>
              </div>

              {!isNew ? (
                <button
                  className={styles.dangerBtn}
                  type="button"
                  disabled={petsStore.deleteLoadingId === id}
                  onClick={() => void petsStore.deletePet(id!)}
                >
                  {petsStore.deleteLoadingId === id ? 'Удаляем...' : 'Удалить питомца'}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={styles.cardCompact}>
            <div className={styles.photoWrap}>
              {view.photoUrl ? (
                <img className={styles.photo} src={view.photoUrl} alt={view.name || 'Питомец'} />
              ) : (
                <div className={styles.photoPlaceholder}>Фото</div>
              )}
            </div>
            <button
              className={styles.cardEditIconBtn}
              type="button"
              aria-label="Редактировать питомца"
              onClick={() => petsStore.startEdit(id!)}
            >
              <img src="/icons/Edit.svg" alt="" aria-hidden="true" width={28} height={28} />
            </button>

            <div className={styles.compactTitle}>{view.name || '—'}</div>
            <div className={styles.compactMetaRow}>
              <span className={styles.label}>Тип:</span>
              <span className={styles.value}>{typeLabel}</span>
            </div>
            <div className={styles.compactMetaRow}>
              <span className={styles.label}>Возраст:</span>
              <span className={styles.value}>{formatAge(view.ageYears, view.ageMonths)}</span>
            </div>
            <div className={styles.compactMetaRow}>
              <span className={styles.label}>Порода:</span>
              <span className={styles.value}>{breedTitle}</span>
            </div>
            <div className={styles.compactMetaRow}>
              <span className={styles.label}>Масса:</span>
              <span className={styles.value}>{sizeLabel}</span>
            </div>
            <button
              className={styles.detailsLink}
              type="button"
              onClick={() => petsStore.toggleExpand(expandId)}
            >
              Подробная информация
              <img
                className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
                src="/icons/chevron.svg"
                alt=""
                aria-hidden="true"
              />
            </button>

            {isExpanded ? (
              <>
                <div className={styles.expandedDetails}>
                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Пол:</span>
                    <span className={styles.value}>
                      {view.gender ? PET_GENDER_LABELS[view.gender] : '—'}
                    </span>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Отношение к другим питомцам:</span>
                    <span className={styles.value}>
                      {view.toOtherPets ? PET_ATTITUDE_LABELS[view.toOtherPets] : '—'}
                    </span>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Отношение к детям до 10 лет:</span>
                    <span className={styles.value}>
                      {view.toKidsUnder10 ? PET_ATTITUDE_LABELS[view.toKidsUnder10] : '—'}
                    </span>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Остаётся один дома</span>
                    <span className={styles.value}>
                      {view.staysHomeAlone
                        ? PET_HOME_ALONE_LABELS[view.staysHomeAlone]
                        : '—'}
                    </span>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Вакцинация</span>
                    <span className={styles.value}>
                      {view.vaccinated ? PET_VACCINATED_LABELS[view.vaccinated] : '—'}
                    </span>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.label}>Другие рекомендации</span>
                    <span className={styles.value}>{view.notes || '—'}</span>
                  </div>
                </div>

                <button
                  className={styles.deletePetBtn}
                  type="button"
                  disabled={petsStore.deleteLoadingId === id}
                  onClick={() => void petsStore.deletePet(id!)}
                >
                  {petsStore.deleteLoadingId === id ? 'Удаляем...' : 'Удалить питомца'}
                </button>
              </>
            ) : null}
          </div>
        )}
      </article>
    );
  },
);

/* ====================== Вспомогательные компоненты ====================== */
function Field(props: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{props.label}</div>
      {props.editable ? (
        <input
          className={styles.input}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <div className={styles.value}>{props.value || '—'}</div>
      )}
    </div>
  );
}

function SelectField(props: {
  label: string;
  value: string;
  editable: boolean;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{props.label}</div>
      {props.editable ? (
        <select
          className={styles.select}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        >
          {props.options.map(([value, title]) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </select>
      ) : (
        <div className={styles.value}>
          {props.options.find(([v]) => v === props.value)?.[1] ?? '—'}
        </div>
      )}
    </div>
  );
}

function formatAge(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${decline(years, ['год', 'года', 'лет'])}`);
  if (months > 0) {
    parts.push(`${months} ${decline(months, ['месяц', 'месяца', 'месяцев'])}`);
  }
  return parts.length === 0 ? '0 месяцев' : parts.join(' ');
}

function decline(value: number, forms: [string, string, string]): string {
  const absValue = Math.abs(value) % 100;
  const lastDigit = absValue % 10;

  if (absValue > 10 && absValue < 20) {
    return forms[2];
  }

  if (lastDigit > 1 && lastDigit < 5) {
    return forms[1];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  return forms[2];
}
