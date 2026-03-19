// src/features/specialist-profile/ui/SpecialistServicePolicyEditor.tsx

import styles from './SpecialistServicePolicyEditor.module.css';

import type {
  SpecialistBookingMode,
  SpecialistServicePriceUnit,
} from '../model/types';

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
  price: string;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy: EditableServiceBookingPolicyForm;
};

type Props = {
  service: EditableServiceFormItem;
  index: number;
  allServices: EditableServiceFormItem[];
  onSetServiceField: (
    index: number,
    field: keyof EditableServiceFormItem,
    value: string,
  ) => void;
  onSetServiceBookingMode: (index: number, mode: SpecialistBookingMode) => void;
  onSetServiceDurationField: (
    index: number,
    field:
      | 'defaultDurationMinutes'
      | 'minDurationMinutes'
      | 'maxDurationMinutes'
      | 'durationStepMinutes',
    value: string,
  ) => void;
  onSetServiceBufferField: (
    index: number,
    field:
      | 'hasBufferBefore'
      | 'bufferBeforeMinutes'
      | 'hasBufferAfter'
      | 'bufferAfterMinutes',
    value: string | boolean,
  ) => void;
  onSetServiceCompatibilityField: (
    index: number,
    field: 'canOverlapWithOtherServices' | 'compatibleServiceIds',
    value: boolean | string[],
  ) => void;
  onSetServiceAdvanceField: (
    index: number,
    field: 'minAdvanceMinutes' | 'maxAdvanceDays',
    value: string,
  ) => void;
  onSetServiceMultiDayField: (
    index: number,
    field:
      | 'allowsMultiDayBooking'
      | 'minStayDays'
      | 'maxStayDays'
      | 'checkInTime'
      | 'checkOutTime',
    value: string | boolean,
  ) => void;
  onSetServiceFlagField: (
    index: number,
    field: 'allowsClientComment' | 'requiresSpecialistConfirmation',
    value: boolean,
  ) => void;
};

const BOOKING_MODE_OPTIONS: Array<{
  value: SpecialistBookingMode;
  label: string;
}> = [
  { value: 'fixed_slot', label: 'Фиксированный слот' },
  { value: 'time_range', label: 'Произвольный интервал' },
  { value: 'multi_day_stay', label: 'Передержка на несколько дней' },
  { value: 'open_request', label: 'Свободный запрос' },
];

function renderNumberInput(
  value: string,
  onChange: (nextValue: string) => void,
  placeholder: string,
) {
  return (
    <input
      className={styles.input}
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export function SpecialistServicePolicyEditor({
  service,
  index,
  allServices,
  onSetServiceField,
  onSetServiceBookingMode,
  onSetServiceDurationField,
  onSetServiceBufferField,
  onSetServiceCompatibilityField,
  onSetServiceAdvanceField,
  onSetServiceMultiDayField,
  onSetServiceFlagField,
}: Props) {
  const compatibleOptions = allServices.filter((item) => item.id !== service.id);
  const bookingPolicy = service.bookingPolicy;

  return (
    <div className={styles.root}>
      <div className={styles.topGrid}>
        <input
          className={styles.input}
          value={service.name}
          onChange={(event) =>
            onSetServiceField(index, 'name', event.target.value)
          }
          placeholder="Название услуги"
        />

        <input
          className={styles.input}
          value={service.locationLabel}
          onChange={(event) =>
            onSetServiceField(index, 'locationLabel', event.target.value)
          }
          placeholder="Где проходит услуга"
        />

        <input
          className={styles.input}
          type="number"
          min="0"
          step="1"
          value={service.price}
          onChange={(event) =>
            onSetServiceField(index, 'price', event.target.value)
          }
          placeholder="Цена"
        />

        <select
          className={styles.select}
          value={service.priceUnit}
          onChange={(event) =>
            onSetServiceField(index, 'priceUnit', event.target.value)
          }
        >
          <option value="hour">за час</option>
          <option value="day">за день</option>
          <option value="service">за услугу</option>
          <option value="walk">за прогулку</option>
          <option value="visit">за визит</option>
        </select>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Формат бронирования</div>

        <select
          className={styles.select}
          value={bookingPolicy.mode}
          onChange={(event) =>
            onSetServiceBookingMode(
              index,
              event.target.value as SpecialistBookingMode,
            )
          }
        >
          {BOOKING_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {bookingPolicy.mode !== 'open_request' ? (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Длительность и шаг</div>

          <div className={styles.grid4}>
            {renderNumberInput(
              bookingPolicy.duration.defaultDurationMinutes,
              (value) =>
                onSetServiceDurationField(index, 'defaultDurationMinutes', value),
              'Длительность по умолчанию, мин',
            )}
            {renderNumberInput(
              bookingPolicy.duration.minDurationMinutes,
              (value) =>
                onSetServiceDurationField(index, 'minDurationMinutes', value),
              'Минимум, мин',
            )}
            {renderNumberInput(
              bookingPolicy.duration.maxDurationMinutes,
              (value) =>
                onSetServiceDurationField(index, 'maxDurationMinutes', value),
              'Максимум, мин',
            )}
            {renderNumberInput(
              bookingPolicy.duration.durationStepMinutes,
              (value) =>
                onSetServiceDurationField(index, 'durationStepMinutes', value),
              'Шаг, мин',
            )}
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Буферы</div>

        <div className={styles.grid2}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={bookingPolicy.buffer.hasBufferBefore}
              onChange={(event) =>
                onSetServiceBufferField(
                  index,
                  'hasBufferBefore',
                  event.target.checked,
                )
              }
            />
            <span>Нужен буфер до услуги</span>
          </label>

          {renderNumberInput(
            bookingPolicy.buffer.bufferBeforeMinutes,
            (value) =>
              onSetServiceBufferField(index, 'bufferBeforeMinutes', value),
            'Буфер до, мин',
          )}

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={bookingPolicy.buffer.hasBufferAfter}
              onChange={(event) =>
                onSetServiceBufferField(
                  index,
                  'hasBufferAfter',
                  event.target.checked,
                )
              }
            />
            <span>Нужен буфер после услуги</span>
          </label>

          {renderNumberInput(
            bookingPolicy.buffer.bufferAfterMinutes,
            (value) =>
              onSetServiceBufferField(index, 'bufferAfterMinutes', value),
            'Буфер после, мин',
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Совместимость</div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={bookingPolicy.compatibility.canOverlapWithOtherServices}
            onChange={(event) =>
              onSetServiceCompatibilityField(
                index,
                'canOverlapWithOtherServices',
                event.target.checked,
              )
            }
          />
          <span>Можно совмещать по времени с другими услугами</span>
        </label>

        {bookingPolicy.compatibility.canOverlapWithOtherServices ? (
          <div className={styles.tagsWrap}>
            {compatibleOptions.length === 0 ? (
              <div className={styles.hint}>Других услуг пока нет.</div>
            ) : (
              compatibleOptions.map((item) => {
                const isChecked =
                  bookingPolicy.compatibility.compatibleServiceIds.includes(
                    item.id,
                  );

                return (
                  <label key={item.id} className={styles.tagCheckbox}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) => {
                        const nextIds = event.target.checked
                          ? [
                              ...bookingPolicy.compatibility.compatibleServiceIds,
                              item.id,
                            ]
                          : bookingPolicy.compatibility.compatibleServiceIds.filter(
                              (value) => value !== item.id,
                            );

                        onSetServiceCompatibilityField(
                          index,
                          'compatibleServiceIds',
                          nextIds,
                        );
                      }}
                    />
                    <span>{item.name || 'Без названия'}</span>
                  </label>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Ограничения по записи</div>

        <div className={styles.grid2}>
          {renderNumberInput(
            bookingPolicy.advance.minAdvanceMinutes,
            (value) =>
              onSetServiceAdvanceField(index, 'minAdvanceMinutes', value),
            'Минимум заранее, мин',
          )}
          {renderNumberInput(
            bookingPolicy.advance.maxAdvanceDays,
            (value) =>
              onSetServiceAdvanceField(index, 'maxAdvanceDays', value),
            'Максимум вперёд, дней',
          )}
        </div>
      </div>

      {bookingPolicy.mode === 'multi_day_stay' ? (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Правила передержки</div>

          <div className={styles.grid2}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={bookingPolicy.multiDay.allowsMultiDayBooking}
                onChange={(event) =>
                  onSetServiceMultiDayField(
                    index,
                    'allowsMultiDayBooking',
                    event.target.checked,
                  )
                }
              />
              <span>Разрешить бронирование на несколько дней</span>
            </label>

            <div />

            {renderNumberInput(
              bookingPolicy.multiDay.minStayDays,
              (value) =>
                onSetServiceMultiDayField(index, 'minStayDays', value),
              'Минимум дней',
            )}

            {renderNumberInput(
              bookingPolicy.multiDay.maxStayDays,
              (value) =>
                onSetServiceMultiDayField(index, 'maxStayDays', value),
              'Максимум дней',
            )}

            <input
              className={styles.input}
              type="time"
              value={bookingPolicy.multiDay.checkInTime}
              onChange={(event) =>
                onSetServiceMultiDayField(index, 'checkInTime', event.target.value)
              }
            />

            <input
              className={styles.input}
              type="time"
              value={bookingPolicy.multiDay.checkOutTime}
              onChange={(event) =>
                onSetServiceMultiDayField(index, 'checkOutTime', event.target.value)
              }
            />
          </div>
        </div>
      ) : null}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Поведение заказа</div>

        <div className={styles.grid2}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={bookingPolicy.allowsClientComment}
              onChange={(event) =>
                onSetServiceFlagField(
                  index,
                  'allowsClientComment',
                  event.target.checked,
                )
              }
            />
            <span>Разрешить комментарий клиента</span>
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={bookingPolicy.requiresSpecialistConfirmation}
              onChange={(event) =>
                onSetServiceFlagField(
                  index,
                  'requiresSpecialistConfirmation',
                  event.target.checked,
                )
              }
            />
            <span>Требуется подтверждение специалистом</span>
          </label>
        </div>
      </div>
    </div>
  );
}