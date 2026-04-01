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
        <h2 className={styles.title}>Питомцы клиента</h2>

        <button
          className={styles.addBtn}
          type="button"
          onClick={() => petsStore.startAdd()}
          disabled={isCreatingNew || petsStore.saveLoading}
        >
          Добавить питомца
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
      isEditing && draft ? (draft.type ?? null) : (view.type ?? null)
    );

    const breedTitle = view.breedId
      ? petsStore.breeds.find((b) => String(b.id) === String(view.breedId))?.title ?? '—'
      : '—';

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) {
        petsStore.setDraftPhotoFromFile(file);
        event.target.value = '';
      }
    };

    const expandId = isNew ? 'new' : (id || '');
    const isExpanded = petsStore.expanded.has(expandId);

    return (
      <article className={styles.card}>
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

            {isEditing && (
              <label className={styles.photoBtn}>
                Изменить фото
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          <div className={styles.mainCol}>
            <Field
              label="Кличка"
              value={view.name}
              editable={isEditing}
              onChange={(value) => petsStore.setDraft('name', value)}
            />

            <div className={styles.row2}>
              <SelectField
                label="Тип"
                value={view.type ?? ''}
                editable={isEditing}
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
                {isEditing ? (
                  <div className={styles.ageRow}>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={String(view.ageYears)}
                      onChange={(e) => petsStore.setDraft('ageYears', Number(e.target.value || 0))}
                      placeholder="годы"
                    />
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      max={11}
                      value={String(view.ageMonths)}
                      onChange={(e) => petsStore.setDraft('ageMonths', Number(e.target.value || 0))}
                      placeholder="мес"
                    />
                  </div>
                ) : (
                  <div className={styles.value}>
                    {formatAge(view.ageYears, view.ageMonths)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.row3}>
              <div className={styles.field}>
                <div className={styles.label}>Порода / вид</div>
                {isEditing ? (
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
                ) : (
                  <div className={styles.value}>{breedTitle}</div>
                )}
              </div>

              <SelectField
                label="Масса (взрослое животное)"
                value={view.size ?? ''}
                editable={isEditing}
                options={[
                  ['', 'Не выбран'],
                  ...PET_WEIGHT_SIZES.map((s) => [s, PET_SIZE_LABELS[s]] as [string, string]),
                ]}
                onChange={(value) =>
                  petsStore.setDraft('size', (value || null) as any)
                }
              />

              <div className={styles.expandCol}>
                <div className={styles.label}>Подробнее</div>
                <button
                  className={styles.expandBtn}
                  type="button"
                  onClick={() => petsStore.toggleExpand(expandId)}
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className={styles.extra}>
                <div className={styles.extraGrid}>
                  <SelectField
                    label="Пол"
                    value={view.gender ?? ''}
                    editable={isEditing}
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
                    editable={isEditing}
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
                    editable={isEditing}
                    options={[
                      ['', 'Не указано'],
                      ['friendly', 'Дружелюбно'],
                      ['neutral', 'Нейтрально'],
                      ['aggressive', 'Агрессивно'],
                      ['unknown', 'Неизвестно'],
                    ]}
                    onChange={(value) =>
                      petsStore.setDraft('toKidsUnder10', (value || null) as PetAttitude | null)
                    }
                  />

                  <SelectField
                    label="Остаётся один дома"
                    value={view.staysHomeAlone ?? ''}
                    editable={isEditing}
                    options={[
                      ['', 'Не указано'],
                      ['ok', 'Спокойно'],
                      ['not_ok', 'Плохо переносит'],
                      ['unknown', 'Неизвестно'],
                    ]}
                    onChange={(value) =>
                      petsStore.setDraft('staysHomeAlone', (value || null) as PetHomeAlone | null)
                    }
                  />

                  <SelectField
                    label="Вакцинация"
                    value={view.vaccinated ?? ''}
                    editable={isEditing}
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
                  {isEditing ? (
                    <textarea
                      className={styles.textarea}
                      value={view.notes}
                      onChange={(e) => petsStore.setDraft('notes', e.target.value)}
                      placeholder="Например: особенности кормления, страхи, любимые игрушки..."
                      rows={4}
                    />
                  ) : (
                    <div className={styles.value}>{view.notes || '—'}</div>
                  )}
                </div>

                {/* Кнопка удаления — показывается только у существующих питомцев */}
                {!isEditing && !isNew && (
                  <div className={styles.deleteRow}>
                    {petsStore.deleteError && (
                      <div className={styles.error}>{petsStore.deleteError}</div>
                    )}

                    <button
                      className={styles.dangerBtn}
                      type="button"
                      disabled={petsStore.deleteLoadingId === id || petsStore.saveLoading}
                      onClick={() => {
                        const confirmed = window.confirm('Удалить питомца? Действие необратимо.');
                        if (!confirmed) return;
                        void petsStore.deletePet(id!);
                      }}
                    >
                      {petsStore.deleteLoadingId === id ? 'Удаляем...' : 'Удалить питомца'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={styles.actions}>
              {isEditing ? (
                <>
                  {petsStore.saveError && <div className={styles.error}>{petsStore.saveError}</div>}

                  <button
                    className={styles.saveBtn}
                    type="button"
                    disabled={petsStore.saveLoading}
                    onClick={() => void petsStore.save()}
                  >
                    {petsStore.saveLoading ? 'Сохраняем...' : 'Сохранить изменения'}
                  </button>

                  <button
                    className={styles.cancelBtn}
                    type="button"
                    disabled={petsStore.saveLoading}
                    onClick={() => petsStore.cancelEdit()}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  {petsStore.saveSuccessId === id && (
                    <div className={styles.state}>Изменения сохранены ✓</div>
                  )}

                  <button
                    className={styles.editBtn}
                    type="button"
                    onClick={() => petsStore.startEdit(id!)}
                  >
                    Редактировать
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }
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
  if (years > 0) parts.push(`${years} г`);
  if (months > 0) parts.push(`${months} мес`);
  return parts.length === 0 ? '0 мес' : parts.join(' ');
}