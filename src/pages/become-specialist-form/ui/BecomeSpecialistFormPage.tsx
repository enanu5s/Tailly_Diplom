// src/pages/become-specialist-form/ui/BecomeSpecialistFormPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { authStore } from '@/features/auth';
import {
  persistSpecialistFormSubmission,
  readSpecialistFormSubmittedEmail,
  specialistApplicationsService,
} from '@/features/specialist-applications';
import type { SpecialistApplicationQuestionnaire } from '@/features/specialist-applications/model/types';
import { LocalitySuggestInput } from '@/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput';
import { BackButton } from '@/shared/ui/back-button';

import styles from './BecomeSpecialistFormPage.module.css';

import type { FormEvent, ReactElement } from 'react';

const SUCCESS_MODAL_DECOR_TL_SRC = '/images/become-specialist/success-modal-decor-tl.png';
const SUCCESS_MODAL_DECOR_BR_SRC = '/images/become-specialist/success-modal-decor-br.png';
const SUBMITTED_CARD_DECOR_TL_SRC = '/images/become-specialist/submitted-card-decor-tl.png';
const SUBMITTED_CARD_DECOR_BR_SRC = '/images/become-specialist/submitted-card-decor-br.png';

const ANIMAL_TYPE_OPTIONS = [
  'Собака',
  'Кошка',
  'Хомяк',
  'Кролик',
  'Морская свинка',
  'Крыса',
  'Мышь',
  'Черепаха',
  'Птица',
  'Рыбка',
  'Шиншила',
  'Хорёк',
  'Ящерица',
  'Змея',
  'Улитка',
] as const;

const SERVICE_FORMAT_OPTIONS = [
  'Выгул',
  'Передержка',
  'Груминг',
  'Тренировки',
  'Фотосессия',
] as const;

function createInitialQuestionnaire(): SpecialistApplicationQuestionnaire {
  return {
    experienceYears: 0,
    animalTypes: [],
    serviceFormats: [],
    canGiveMedication: false,
    canHandleDifficultBehavior: false,
    canTakeOvernightOrders: false,
    hasOwnPets: false,
    hasPetFirstAidBasics: false,
    housingType: '',
    districtPreferences: '',
    schedulePreferences: '',
    portfolioUrl: '',
    motivation: '',
    additionalInfo: '',
  };
}

function toggleArrayValue(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

function buildFullName(first: string, last: string, patronymic: string): string {
  return [last.trim(), first.trim(), patronymic.trim()].filter(Boolean).join(' ');
}

export const BecomeSpecialistFormPage = (): ReactElement => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  const [questionnaire, setQuestionnaire] = useState<SpecialistApplicationQuestionnaire>(
    createInitialQuestionnaire(),
  );
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storedSubmissionEmail, setStoredSubmissionEmail] = useState<string | null>(
    null,
  );
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalEmail, setSuccessModalEmail] = useState('');

  useEffect(() => {
    const syncStoredEmail = (): void => {
      setStoredSubmissionEmail(readSpecialistFormSubmittedEmail());
    };

    syncStoredEmail();

    return authStore.subscribe(syncStoredEmail);
  }, []);

  const setQuestionnaireField = <K extends keyof SpecialistApplicationQuestionnaire>(
    key: K,
    value: SpecialistApplicationQuestionnaire[K],
  ): void => {
    setQuestionnaire((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!consent) {
      return 'Нужно согласие на обработку персональных данных.';
    }

    if (!lastName.trim()) {
      return 'Укажи фамилию.';
    }

    if (!firstName.trim()) {
      return 'Укажи имя.';
    }

    if (!email.trim()) {
      return 'Укажи email.';
    }

    if (!phone.trim()) {
      return 'Укажи телефон.';
    }

    if (!city.trim()) {
      return 'Укажи город.';
    }

    if (!about.trim()) {
      return 'Заполни поле «Кратко о себе».';
    }

    if (
      !Number.isFinite(questionnaire.experienceYears) ||
      questionnaire.experienceYears <= 0
    ) {
      return 'Укажи опыт работы с животными числом лет.';
    }

    if (questionnaire.animalTypes.length === 0) {
      return 'Выбери хотя бы один тип животных.';
    }

    if (questionnaire.serviceFormats.length === 0) {
      return 'Выбери хотя бы один формат услуг.';
    }

    if (!questionnaire.housingType.trim()) {
      return 'Опиши условия, в которых будешь работать с питомцем.';
    }

    if (!questionnaire.schedulePreferences.trim()) {
      return 'Укажи предпочитаемый график работы.';
    }

    if (!questionnaire.motivation.trim()) {
      return 'Расскажи, почему хочешь стать специалистом в Тейлли.';
    }

    return null;
  };

  const validationError = validateForm();
  const canSubmit = validationError === null;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');

    const submitValidationError = validateForm();

    if (submitValidationError) {
      setError(submitValidationError);
      return;
    }

    setLoading(true);

    const submittedEmail = email.trim();

    try {
      await specialistApplicationsService.createApplication({
        fullName: buildFullName(firstName, lastName, patronymic),
        email: submittedEmail,
        phone: phone.trim(),
        city: city.trim(),
        about: about.trim(),
        questionnaire: {
          ...questionnaire,
          housingType: questionnaire.housingType.trim(),
          districtPreferences: questionnaire.districtPreferences.trim(),
          schedulePreferences: questionnaire.schedulePreferences.trim(),
          portfolioUrl: questionnaire.portfolioUrl.trim(),
          motivation: questionnaire.motivation.trim(),
          additionalInfo: questionnaire.additionalInfo.trim(),
        },
      });

      persistSpecialistFormSubmission(submittedEmail);
      setStoredSubmissionEmail(submittedEmail);
      setSuccessModalEmail(submittedEmail);
      setSuccessModalOpen(true);
      setFirstName('');
      setLastName('');
      setPatronymic('');
      setEmail('');
      setPhone('');
      setCity('');
      setAbout('');
      setQuestionnaire(createInitialQuestionnaire());
      setConsent(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось отправить заявку.',
      );
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = (): void => {
    setSuccessModalOpen(false);
  };

  useEffect(() => {
    if (!successModalOpen) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setSuccessModalOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [successModalOpen]);

  const feedbackLine = (address: string): ReactElement => (
    <>
      Обратная связь вам придёт на вашу почту:{' '}
      <span className={styles.feedbackEmail}>{address}</span>
    </>
  );

  if (storedSubmissionEmail) {
    return (
      <section className={styles.page}>
        <div className={styles.shell}>
          <BackButton className={styles.backButton} fallbackTo="/become-specialist">
            <>
              <span className={styles.backArrow} aria-hidden />
              Назад
            </>
          </BackButton>

          <h1 className={styles.title}>Анкета специалиста</h1>

          <div className={styles.submittedCard} role="status">
            <img
              className={styles.submittedShapeLeft}
              src={SUBMITTED_CARD_DECOR_TL_SRC}
              alt=""
              aria-hidden
              width={294}
              height={124}
              draggable={false}
            />
            <img
              className={styles.submittedShapeRight}
              src={SUBMITTED_CARD_DECOR_BR_SRC}
              alt=""
              aria-hidden
              width={294}
              height={124}
              draggable={false}
            />
            <h2 className={styles.submittedHeading}>Ваша анкета уже отправлена</h2>
            <p className={styles.submittedMessage}>{feedbackLine(storedSubmissionEmail)}</p>
          </div>
        </div>

        {successModalOpen ? (
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeSuccessModal();
              }
            }}
          >
            <div
              className={styles.successModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="specialist-form-success-title"
            >
              <img
                className={styles.successModalShapeTop}
                src={SUCCESS_MODAL_DECOR_TL_SRC}
                alt=""
                aria-hidden
                width={202}
                height={124}
                draggable={false}
              />
              <img
                className={styles.successModalShapeBottom}
                src={SUCCESS_MODAL_DECOR_BR_SRC}
                alt=""
                aria-hidden
                width={213}
                height={124}
                draggable={false}
              />
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeSuccessModal}
                aria-label="Закрыть"
              >
                <span className={styles.modalCloseLine} />
                <span className={styles.modalCloseLine} />
              </button>
              <h2 id="specialist-form-success-title" className={styles.modalTitle}>
                Анкета отправлена
              </h2>
              <p className={styles.modalMessage}>{feedbackLine(successModalEmail)}</p>
              <Link className={styles.modalPrimaryButton} to="/">
                На главную страницу
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <BackButton className={styles.backButton} fallbackTo="/become-specialist">
          <>
            <span className={styles.backArrow} aria-hidden />
            Назад
          </>
        </BackButton>

        <h1 className={styles.title}>Анкета специалиста</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.card}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Основные данные</h2>

              <div className={styles.gridBasic}>
                <label className={styles.field}>
                  <span className={styles.label}>Имя</span>
                  <input
                    className={styles.input}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Иван"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Фамилия</span>
                  <input
                    className={styles.input}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Иванов"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Отчество (не обязательно)</span>
                  <input
                    className={styles.input}
                    value={patronymic}
                    onChange={(event) => setPatronymic(event.target.value)}
                    placeholder="Иванович"
                  />
                </label>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="become-specialist-city">
                    Город
                  </label>
                  <LocalitySuggestInput
                    id="become-specialist-city"
                    value={city}
                    onChange={setCity}
                    placeholder="Начните вводить..."
                    inputClassName={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.gridContact}>
                <label className={styles.field}>
                  <span className={styles.label}>Телефон</span>
                  <input
                    className={styles.input}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+7 (900) 900-00-90"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name123@tailly.local"
                    required
                  />
                </label>
              </div>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>Кратко о себе</span>
                <textarea
                  className={styles.textarea}
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  placeholder="Расскажите о своём опыте, стиле общения с клиентами, сильных сторонах и тд."
                  required
                />
              </label>
            </section>
          </div>

          <div className={styles.card}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Опыт и специализация</h2>

              <div className={styles.expRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Опыт работы с животными</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    max={60}
                    step={1}
                    inputMode="numeric"
                    value={questionnaire.experienceYears || ''}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, '').slice(0, 2);
                      const years = Math.min(60, Math.max(0, Number(digits) || 0));
                      setQuestionnaireField('experienceYears', years);
                    }}
                    placeholder="Например: 1 год, 5 лет"
                    required
                  />
                </label>

                <div className={styles.field}>
                  <span className={styles.label}>С какими животными работаешь?</span>
                  <div className={styles.chipWrap}>
                    {ANIMAL_TYPE_OPTIONS.map((option) => (
                      <label key={option} className={styles.chip}>
                        <input
                          type="checkbox"
                          checked={questionnaire.animalTypes.includes(option)}
                          onChange={() =>
                            setQuestionnaireField(
                              'animalTypes',
                              toggleArrayValue(questionnaire.animalTypes, option),
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.servicesBlock}>
                <span className={styles.label}>Какие услуги готов оказывать?</span>
                <div className={styles.chipWrap}>
                  {SERVICE_FORMAT_OPTIONS.map((option) => (
                    <label key={option} className={styles.chip}>
                      <input
                        type="checkbox"
                        checked={questionnaire.serviceFormats.includes(option)}
                        onChange={() =>
                          setQuestionnaireField(
                            'serviceFormats',
                            toggleArrayValue(questionnaire.serviceFormats, option),
                          )
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className={styles.card}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Условия работы</h2>

              <div className={styles.housingTop}>
                <label className={styles.housingField}>
                  <span className={styles.label}>
                    Условия, в которых будешь работать с питомцем
                  </span>
                  <input
                    className={styles.input}
                    value={questionnaire.housingType}
                    onChange={(event) =>
                      setQuestionnaireField('housingType', event.target.value)
                    }
                    placeholder="Например: квартира/дом, есть ли отдельная комната, дети, другие животные"
                    required
                  />
                </label>

                <label className={styles.ownPets}>
                  <input
                    type="checkbox"
                    checked={questionnaire.hasOwnPets}
                    onChange={(event) =>
                      setQuestionnaireField('hasOwnPets', event.target.checked)
                    }
                  />
                  <span>Есть свои питомцы</span>
                </label>
              </div>

              <div className={styles.fieldStack}>
                <label className={styles.field}>
                  <span className={styles.label}>
                    Районы и география выезда (если нужно)
                  </span>
                  <input
                    className={styles.input}
                    value={questionnaire.districtPreferences}
                    onChange={(event) =>
                      setQuestionnaireField('districtPreferences', event.target.value)
                    }
                    placeholder="Например: центр города, северный район, до 30 минут на авто/общественном транспорте"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Предпочтительный график</span>
                  <input
                    className={styles.input}
                    value={questionnaire.schedulePreferences}
                    onChange={(event) =>
                      setQuestionnaireField('schedulePreferences', event.target.value)
                    }
                    placeholder="Например: будни после 18:00, выходные, беру ночные заказы"
                    required
                  />
                </label>
              </div>
            </section>
          </div>

          <div className={styles.card}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Навыки и готовность к сложным заказам
              </h2>

              <div className={styles.field}>
                <span className={styles.label}>Выберите навыки, к которым вы готовы</span>
                <div className={styles.skillGrid}>
                  <label className={styles.skillPill}>
                    <input
                      type="checkbox"
                      checked={questionnaire.canGiveMedication}
                      onChange={(event) =>
                        setQuestionnaireField('canGiveMedication', event.target.checked)
                      }
                    />
                    <span>Готов(а) давать лекарства по инструкции</span>
                  </label>

                  <label className={styles.skillPill}>
                    <input
                      type="checkbox"
                      checked={questionnaire.canHandleDifficultBehavior}
                      onChange={(event) =>
                        setQuestionnaireField(
                          'canHandleDifficultBehavior',
                          event.target.checked,
                        )
                      }
                    />
                    <span>Есть опыт с тревожными или сложными животными</span>
                  </label>

                  <label className={styles.skillPill}>
                    <input
                      type="checkbox"
                      checked={questionnaire.hasPetFirstAidBasics}
                      onChange={(event) =>
                        setQuestionnaireField(
                          'hasPetFirstAidBasics',
                          event.target.checked,
                        )
                      }
                    />
                    <span>Знаю базовые действия первой помощи питомцу</span>
                  </label>

                  <label className={styles.skillPill}>
                    <input
                      type="checkbox"
                      checked={questionnaire.canTakeOvernightOrders}
                      onChange={(event) =>
                        setQuestionnaireField(
                          'canTakeOvernightOrders',
                          event.target.checked,
                        )
                      }
                    />
                    <span>Готов(а) брать ночные и длительные заказы</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.card}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Мотивация и материалы</h2>

              <label className={`${styles.field} ${styles.portfolioField}`}>
                <span className={styles.label}>Ссылка на портфолио или соцсети</span>
                <input
                  className={styles.input}
                  value={questionnaire.portfolioUrl}
                  onChange={(event) =>
                    setQuestionnaireField('portfolioUrl', event.target.value)
                  }
                  placeholder="https://..."
                />
              </label>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>
                  Почему хочешь стать специалистом в Тейлли?
                </span>
                <textarea
                  className={styles.textarea}
                  value={questionnaire.motivation}
                  onChange={(event) =>
                    setQuestionnaireField('motivation', event.target.value)
                  }
                  placeholder="Что важно, почему тебе подходит платформа и как видишь свою работу"
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>Дополнительная информация</span>
                <textarea
                  className={styles.textarea}
                  value={questionnaire.additionalInfo}
                  onChange={(event) =>
                    setQuestionnaireField('additionalInfo', event.target.value)
                  }
                  placeholder="Можно добавить особенности графика, ограничения или просто важные детали"
                />
              </label>
            </section>
          </div>

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span className={styles.consentText}>
              Я согласен(а) на{' '}
              <a href="/docs/personal-data-agreement.pdf" download>
                обработку персональных данных
              </a>
            </span>
          </label>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.actions}>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading || !canSubmit}
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
