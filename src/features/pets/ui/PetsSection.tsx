//src/features/pets/ui/PetsSection.tsx
import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { petsStore } from '../model/petsStore';
import styles from './PetsSection.module.css';

export const PetsSection = observer(() => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void petsStore.load();
  }, []);

  return (
    <section id="pets-section" className={styles.section} ref={rootRef}>
      <div className={styles.headRow}>
        <h2 className={styles.title}>Питомцы клиента</h2>
        <button className={styles.addBtn} type="button" onClick={() => petsStore.startAdd()}>
          Добавить питомца
        </button>
      </div>

      {petsStore.error && <div className={styles.error}>{petsStore.error}</div>}
      {petsStore.loading && petsStore.pets.length === 0 && <div className={styles.state}>Загружаем питомцев...</div>}

      <div className={styles.list}>
        {/* если сейчас редактируем добавление — показываем draft как карточку */}
        {petsStore.editingId && petsStore.draft && !petsStore.pets.some((p) => p.id === petsStore.editingId) && (
          <PetCard id={petsStore.editingId} />
        )}

        {petsStore.pets.map((p) => (
          <PetCard key={p.id} id={p.id} />
        ))}
      </div>
    </section>
  );
});

const PetCard = observer(({ id }: { id: string }) => {
  const pet = petsStore.pets.find((x) => x.id === id);
  const isEditing = petsStore.editingId === id;
  const isExpanded = petsStore.expanded.has(id);
  const draft = isEditing ? petsStore.draft : null;
  

  const view = pet ?? draft;
  if (!view) return null;

  const breeds = petsStore.getBreedsForType(isEditing ? draft?.type ?? null : view.type);

  const breedTitle =
    view.breedId
      ? petsStore.breeds.find((b) => String(b.id) === String(view.breedId))?.title ?? '—'
      : '—';

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.photoCol}>
          <div className={styles.photoWrap}>
            {view.photoUrl ? (
              <img className={styles.photo} src={view.photoUrl} alt={view.name || 'Питомец'} />
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) petsStore.setDraftPhotoFromFile(file);
                }}
              />
            </label>
          )}
        </div>

        <div className={styles.mainCol}>
          <div className={styles.row2}>
            <Field
              label="Кличка"
              value={isEditing ? draft?.name ?? '' : view.name}
              editable={isEditing}
              onChange={(v) => petsStore.setDraft('name', v)}
            />

            <div className={styles.field}>
              <div className={styles.label}>Тип</div>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={draft?.type ?? ''}
                  onChange={(e) => petsStore.setDraft('type', (e.target.value || null) as any)}
                >
                  <option value="">Не выбран</option>
                  <option value="dog">Собака</option>
                  <option value="cat">Кошка</option>
                  <option value="other">Другое</option>
                </select>
              ) : (
                <div className={styles.value}>{view.type ? mapType(view.type) : '—'}</div>
              )}
            </div>
          </div>

<div className={styles.row3}>
            <div className={styles.field}>
              <div className={styles.label}>Возраст</div>
              {isEditing ? (
                <div className={styles.ageRow}>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    value={draft?.ageYears ?? 0}
                    onChange={(e) => petsStore.setDraft('ageYears', Number(e.target.value))}
                    placeholder="годы"
                  />
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    max={11}
                    value={draft?.ageMonths ?? 0}
                    onChange={(e) => petsStore.setDraft('ageMonths', Number(e.target.value))}
                    placeholder="мес"
                  />
                </div>
              ) : (
                <div className={styles.value}>
                  {view.ageYears} г {view.ageMonths} мес
                </div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Порода / вид</div>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={draft?.breedId ?? ''}
                  onChange={(e) => petsStore.setBreed(e.target.value || null)}
                >
                  <option value="">Не выбрано</option>
                  {breeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={styles.value}>{breedTitle}</div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Размер</div>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={draft?.size ?? ''}
                  onChange={(e) => petsStore.setDraft('size', (e.target.value || null) as any)}
                >
                  <option value="">Не выбран</option>
                  <option value="xs">XS</option>
                  <option value="s">S</option>
                  <option value="m">M</option>
                  <option value="l">L</option>
                  <option value="xl">XL</option>
                </select>
              ) : (
                <div className={styles.value}>{view.size ? view.size.toUpperCase() : '—'}</div>
              )}
            </div>
          </div>
        </div>

        <button className={styles.expandBtn} type="button" onClick={() => petsStore.toggleExpand(id)} aria-label="Раскрыть">
          {isExpanded ? '▾' : '▸'}
        </button>
      </div>

{isExpanded && (
        <div className={styles.extra}>
          <div className={styles.extraGrid}>
            <SelectField
              label="Пол"
              value={isEditing ? draft?.gender ?? '' : view.gender ?? ''}
              editable={isEditing}
              options={[
                ['', '—'],
                ['male', 'Самец'],
                ['female', 'Самка'],
              ]}
              onChange={(v) => petsStore.setDraft('gender', (v || null) as any)}
            />
            <SelectField
              label="Отношение к другим питомцам"
              value={isEditing ? draft?.toOtherPets ?? '' : view.toOtherPets ?? ''}
              editable={isEditing}
              options={[
                ['', '—'],
                ['friendly', 'Дружелюбное'],
                ['neutral', 'Нейтральное'],
                ['aggressive', 'Агрессивное'],
                ['unknown', 'Неизвестно'],
              ]}
              onChange={(v) => petsStore.setDraft('toOtherPets', (v || null) as any)}
            />
            <SelectField
              label="Отношение к детям до 10 лет"
              value={isEditing ? draft?.toKidsUnder10 ?? '' : view.toKidsUnder10 ?? ''}
              editable={isEditing}
              options={[
                ['', '—'],
                ['friendly', 'Дружелюбное'],
                ['neutral', 'Нейтральное'],
                ['aggressive', 'Агрессивное'],
                ['unknown', 'Неизвестно'],
              ]}
              onChange={(v) => petsStore.setDraft('toKidsUnder10', (v || null) as any)}
            />
            <SelectField
              label="Остаётся один дома"
              value={isEditing ? draft?.staysHomeAlone ?? '' : view.staysHomeAlone ?? ''}
              editable={isEditing}
              options={[
                ['', '—'],
                ['ok', 'Да'],
                ['not_ok', 'Нет'],
                ['unknown', 'Неизвестно'],
              ]}
              onChange={(v) => petsStore.setDraft('staysHomeAlone', (v || null) as any)}
            />
            <SelectField
              label="Вакцинации"
              value={isEditing ? draft?.vaccinated ?? '' : view.vaccinated ?? ''}
              editable={isEditing}
              options={[
                ['', '—'],
                ['yes', 'Да'],
                ['no', 'Нет'],
                ['unknown', 'Неизвестно'],
              ]}
              onChange={(v) => petsStore.setDraft('vaccinated', (v || null) as any)}
            />
          </div>

          <div className={styles.notesRow}>
            <div className={styles.label}>Другие рекомендации</div>
            {isEditing ? (
              <textarea
                className={styles.textarea}
                rows={4}
                value={draft?.notes ?? ''}
                onChange={(e) => petsStore.setDraft('notes', e.target.value)}
                placeholder="Например: особенности кормления, страхи, любимые игрушки..."
              />
            ) : (
              <div className={styles.value}>{view.notes || '—'}</div>
            )}
          </div>

          <div className={styles.deleteRow}>
            {petsStore.deleteError && <div className={styles.error}>{petsStore.deleteError}</div>}

            <button
              className={styles.dangerBtn}
              type="button"
              disabled={petsStore.deleteLoadingId === id || petsStore.saveLoading}
              onClick={() => {
                const ok = window.confirm('Удалить питомца? Действие необратимо.');
                if (!ok) return;
                void petsStore.deletePet(id);
              }}
            >
              {petsStore.deleteLoadingId === id ? 'Удаляем...' : 'Удалить питомца'}
            </button>
          </div>

        </div>
      )}

      <div className={styles.actions}>
        {isEditing ? (
          <>
            {petsStore.saveError && <div className={styles.error}>{petsStore.saveError}</div>}
            <button className={styles.saveBtn} type="button" disabled={petsStore.saveLoading} onClick={() => void petsStore.save()}>
              {petsStore.saveLoading ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
            <button className={styles.cancelBtn} type="button" onClick={() => petsStore.cancelEdit()} disabled={petsStore.saveLoading}>
              Отмена
            </button>
          </>
        ) : (
          <button className={styles.editBtn} type="button" onClick={() => petsStore.startEdit(id)}>
            Редактировать
          </button>
        )}
      </div>
    </div>
  );
});

function Field(props: { label: string; value: string; editable: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{props.label}</div>
      {props.editable ? (
        <input className={styles.input} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
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
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{props.label}</div>
      {props.editable ? (
        <select className={styles.select} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
          {props.options.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        <div className={styles.value}>{props.options.find(([v]) => v === props.value)?.[1] ?? '—'}</div>
      )}
    </div>
  );
}

function mapType(t: any) {
  if (t === 'dog') return 'Собака';
  if (t === 'cat') return 'Кошка';
  return 'Другое';
}