import { observer } from 'mobx-react-lite';
import { useEffect, type ChangeEvent, type ReactElement } from 'react';

import { petsStore } from '../model/petsStore';

import styles from './PetsSection.module.css';

import type {
  Pet,
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

  const draftCardId =
    petsStore.editingId &&
    petsStore.draft &&
    !petsStore.pets.some((pet) => pet.id === petsStore.editingId)
      ? petsStore.editingId
      : null;

  return (
    <section className={styles.section}>
      <div className={styles.headRow}>
        <h2 className={styles.title}>Питомцы клиента</h2>

        <button
          className={styles.addBtn}
          type="button"
          onClick={() => petsStore.startAdd()}
        >
          Добавить питомца
        </button>
      </div>

      {petsStore.error ? <div className={styles.error}>{petsStore.error}</div> : null}

      {petsStore.loading && petsStore.pets.length === 0 ? (
        <div className={styles.state}>Загружаем питомцев...</div>
      ) : null}

      <div className={styles.list}>
        {draftCardId ? <PetCard id={draftCardId} /> : null}

        {petsStore.pets.map((pet) => (
          <PetCard key={pet.id} id={pet.id} />
        ))}
      </div>
    </section>
  );
});

const PetCard = observer(({ id }: { id: string }): ReactElement | null => {
  const pet = petsStore.pets.find((item) => item.id === id);
  const isEditing = petsStore.editingId === id;
  const isExpanded = petsStore.expanded.has(id);
  const draft = isEditing ? petsStore.draft : null;
  const view = pet ?? draft;

  if (!view) {
    return null;
  }

  const breeds = petsStore.getBreedsForType(
    isEditing ? (draft?.type ?? null) : view.type,
  );

  const breedTitle = view.breedId
    ? petsStore.breeds.find((breed) => String(breed.id) === String(view.breedId))
        ?.title ?? '—'
    : '—';

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    petsStore.setDraftPhotoFromFile(file);
    event.target.value = '';
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.photoCol}>
          <div className={styles.photoWrap}>
            {view.photoUrl ? (
              <img className={styles.photo} src={view.photoUrl} alt={view.name || 'Питомец'} />
            ) : (
              <div className={styles.photoPlaceholder}>Фото</div>
            )}
          </div>

          {isEditing ? (
            <label className={styles.photoBtn}>
              Изменить фото
              <input
                className={styles.fileInput}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          ) : null}
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
                ['dog', 'Собака'],
                ['cat', 'Кошка'],
                ['other', 'Другое'],
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
                    onChange={(event) =>
                      petsStore.setDraft(
                        'ageYears',
                        Number(event.target.value || 0),
                      )
                    }
                    placeholder="годы"
                  />

                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    max={11}
                    value={String(view.ageMonths)}
                    onChange={(event) =>
                      petsStore.setDraft(
                        'ageMonths',
                        Number(event.target.value || 0),
                      )
                    }
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
                  onChange={(event) =>
                    petsStore.setBreed(event.target.value || null)
                  }
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
              label="Размер"
              value={view.size ?? ''}
              editable={isEditing}
              options={[
                ['', 'Не выбран'],
                ['xs', 'XS'],
                ['s', 'S'],
                ['m', 'M'],
                ['l', 'L'],
                ['xl', 'XL'],
              ]}
              onChange={(value) =>
                petsStore.setDraft('size', (value || null) as Pet['size'])
              }
            />

            <div className={styles.expandCol}>
              <div className={styles.label}>Подробнее</div>
              <button
                className={styles.expandBtn}
                type="button"
                onClick={() => petsStore.toggleExpand(id)}
                aria-label={isExpanded ? 'Скрыть детали' : 'Показать детали'}
              >
                {isExpanded ? '▾' : '▸'}
              </button>
            </div>
          </div>

          {isExpanded ? (
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
                    petsStore.setDraft(
                      'gender',
                      (value || null) as PetGender | null,
                    )
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
                    petsStore.setDraft(
                      'toOtherPets',
                      (value || null) as PetAttitude | null,
                    )
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
                    petsStore.setDraft(
                      'toKidsUnder10',
                      (value || null) as PetAttitude | null,
                    )
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
                    petsStore.setDraft(
                      'staysHomeAlone',
                      (value || null) as PetHomeAlone | null,
                    )
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
                    petsStore.setDraft(
                      'vaccinated',
                      (value || null) as PetVaccinated | null,
                    )
                  }
                />
              </div>

              <div className={styles.notesRow}>
                <div className={styles.label}>Другие рекомендации</div>

                {isEditing ? (
                  <textarea
                    className={styles.textarea}
                    value={view.notes}
                    onChange={(event) =>
                      petsStore.setDraft('notes', event.target.value)
                    }
                    placeholder="Например: особенности кормления, страхи, любимые игрушки..."
                    rows={4}
                  />
                ) : (
                  <div className={styles.value}>{view.notes || '—'}</div>
                )}
              </div>

              {!isEditing ? (
                <div className={styles.deleteRow}>
                  {petsStore.deleteError ? (
                    <div className={styles.error}>{petsStore.deleteError}</div>
                  ) : null}

                  <button
                    className={styles.dangerBtn}
                    type="button"
                    disabled={
                      petsStore.deleteLoadingId === id || petsStore.saveLoading
                    }
                    onClick={() => {
                      const confirmed = window.confirm(
                        'Удалить питомца? Действие необратимо.',
                      );

                      if (!confirmed) {
                        return;
                      }

                      void petsStore.deletePet(id);
                    }}
                  >
                    {petsStore.deleteLoadingId === id
                      ? 'Удаляем...'
                      : 'Удалить питомца'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.actions}>
            {isEditing ? (
              <>
                {petsStore.saveError ? (
                  <div className={styles.error}>{petsStore.saveError}</div>
                ) : null}

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
                {petsStore.saveSuccessId === id ? (
                  <div className={styles.state}>Изменения сохранены.</div>
                ) : null}

                <button
                  className={styles.editBtn}
                  type="button"
                  onClick={() => petsStore.startEdit(id)}
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
});

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
          onChange={(event) => props.onChange(event.target.value)}
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
          onChange={(event) => props.onChange(event.target.value)}
        >
          {props.options.map(([value, title]) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </select>
      ) : (
        <div className={styles.value}>
          {props.options.find(([value]) => value === props.value)?.[1] ?? '—'}
        </div>
      )}
    </div>
  );
}

function formatAge(years: number, months: number): string {
  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} г`);
  }

  if (months > 0) {
    parts.push(`${months} мес`);
  }

  if (parts.length === 0) {
    return '0 мес';
  }

  return parts.join(' ');
}