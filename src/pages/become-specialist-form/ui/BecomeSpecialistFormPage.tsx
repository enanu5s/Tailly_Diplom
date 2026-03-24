// src/pages/become-specialist-form/ui/BecomeSpecialistFormPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { specialistApplicationsService } from '@/features/specialist-applications';
import type { SpecialistApplicationQuestionnaire } from '@/features/specialist-applications/model/types';
import { LocalitySuggestInput } from '@/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput';
import { BackButton } from '@/shared/ui/back-button';

import styles from './BecomeSpecialistFormPage.module.css';

import type { FormEvent, ReactElement } from 'react';

const ANIMAL_TYPE_OPTIONS = [
  'Собаки',
  'Кошки',
  'Птицы',
  'Грызуны',
  'Рыбы',
  'Рептилии',
  'Другие',
] as const;

const SERVICE_FORMAT_OPTIONS = [
  'Выгул',
  'Дневной присмотр',
  'Ночной присмотр',
  'Передержка у клиента',
  'Передержка у себя',
  'Сопровождение в ветклинику',
  'Регулярные визиты',
] as const;

function createInitialQuestionnaire(): SpecialistApplicationQuestionnaire {
  return {
    experienceYears: '',
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

export const BecomeSpecialistFormPage = (): ReactElement => {
  const [name, setName] = useState('');
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
  const [success, setSuccess] = useState(false);

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

    if (!name.trim()) {
      return 'Укажи ФИО.';
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

    if (!questionnaire.experienceYears.trim()) {
      return 'Укажи опыт работы с животными.';
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
      return 'Расскажи, почему хочешь стать специалистом Tailly.';
    }

    return null;
  };

  const validationError = validateForm();
  const canSubmit = validationError === null;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    const submitValidationError = validateForm();

    if (submitValidationError) {
      setError(submitValidationError);
      return;
    }

    setLoading(true);

    try {
      await specialistApplicationsService.createApplication({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        about: about.trim(),
        questionnaire: {
          ...questionnaire,
          experienceYears: questionnaire.experienceYears.trim(),
          housingType: questionnaire.housingType.trim(),
          districtPreferences: questionnaire.districtPreferences.trim(),
          schedulePreferences: questionnaire.schedulePreferences.trim(),
          portfolioUrl: questionnaire.portfolioUrl.trim(),
          motivation: questionnaire.motivation.trim(),
          additionalInfo: questionnaire.additionalInfo.trim(),
        },
      });

      setSuccess(true);
      setName('');
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

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <BackButton
          className={styles.backButton}
          fallbackTo="/become-specialist"
          label="← Назад"
        />

        <div className={styles.hero}>
          <div className={styles.badge}>Tailly</div>
          <h1 className={styles.title}>Анкета специалиста</h1>
          <p className={styles.subtitle}>
            Мы собираем не просто контактные данные, а структурированную анкету, чтобы
            администраторам было легче провести интервью и быстрее принять решение.
          </p>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Основные данные</h2>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>ФИО</span>
                  <input
                    className={styles.input}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Иванова Анна Сергеевна"
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
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Телефон</span>
                  <input
                    className={styles.input}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+7 (900) 000-00-00"
                    required
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
                    placeholder="Начните вводить город или ПГТ…"
                    inputClassName={styles.input}
                    required
                  />
                </div>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>Кратко о себе</span>
                  <textarea
                    className={styles.textarea}
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    placeholder="Расскажите о своём опыте, стиле общения с клиентами и сильных сторонах."
                    required
                  />
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Опыт и специализация</h2>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Опыт работы с животными</span>
                  <input
                    className={styles.input}
                    value={questionnaire.experienceYears}
                    onChange={(event) =>
                      setQuestionnaireField('experienceYears', event.target.value)
                    }
                    placeholder="Например: 2 года, 5+ лет, с 2021 года"
                    required
                  />
                </label>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>С какими животными работаешь</span>
                  <div className={styles.checkboxGrid}>
                    {ANIMAL_TYPE_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkboxCard}>
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
                </label>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>Какие услуги готов оказывать</span>
                  <div className={styles.checkboxGrid}>
                    {SERVICE_FORMAT_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkboxCard}>
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
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Условия работы</h2>

              <div className={styles.grid}>
                <label className={styles.fieldWide}>
                  <span className={styles.label}>
                    Условия, в которых будешь работать с питомцем
                  </span>
                  <textarea
                    className={styles.textarea}
                    value={questionnaire.housingType}
                    onChange={(event) =>
                      setQuestionnaireField('housingType', event.target.value)
                    }
                    placeholder="Например: квартира / дом, есть ли отдельная комната, дети, другие животные."
                    required
                  />
                </label>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>Районы и география выезда</span>
                  <textarea
                    className={styles.textarea}
                    value={questionnaire.districtPreferences}
                    onChange={(event) =>
                      setQuestionnaireField('districtPreferences', event.target.value)
                    }
                    placeholder="Например: центр города, северные районы, до 30 минут на авто."
                  />
                </label>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>Предпочтительный график</span>
                  <textarea
                    className={styles.textarea}
                    value={questionnaire.schedulePreferences}
                    onChange={(event) =>
                      setQuestionnaireField('schedulePreferences', event.target.value)
                    }
                    placeholder="Например: будни после 18:00, выходные, беру ночные заказы."
                    required
                  />
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Навыки и готовность к сложным кейсам
              </h2>

              <div className={styles.grid}>
                <div className={styles.fieldWide}>
                  <div className={styles.toggleGrid}>
                    <label className={styles.toggleCard}>
                      <input
                        type="checkbox"
                        checked={questionnaire.canGiveMedication}
                        onChange={(event) =>
                          setQuestionnaireField('canGiveMedication', event.target.checked)
                        }
                      />
                      <span>Готов(а) давать лекарства по инструкции</span>
                    </label>

                    <label className={styles.toggleCard}>
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

                    <label className={styles.toggleCard}>
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

                    <label className={styles.toggleCard}>
                      <input
                        type="checkbox"
                        checked={questionnaire.hasOwnPets}
                        onChange={(event) =>
                          setQuestionnaireField('hasOwnPets', event.target.checked)
                        }
                      />
                      <span>Есть свои питомцы</span>
                    </label>

                    <label className={styles.toggleCard}>
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
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Мотивация и материалы</h2>

              <div className={styles.grid}>
                <label className={styles.field}>
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

                <label className={styles.fieldWide}>
                  <span className={styles.label}>
                    Почему хочешь стать специалистом Tailly
                  </span>
                  <textarea
                    className={styles.textarea}
                    value={questionnaire.motivation}
                    onChange={(event) =>
                      setQuestionnaireField('motivation', event.target.value)
                    }
                    placeholder="Что важно в этой роли, почему тебе подходит платформа и как видишь свою работу."
                    required
                  />
                </label>

                <label className={styles.fieldWide}>
                  <span className={styles.label}>Дополнительная информация</span>
                  <textarea
                    className={styles.textarea}
                    value={questionnaire.additionalInfo}
                    onChange={(event) =>
                      setQuestionnaireField('additionalInfo', event.target.value)
                    }
                    placeholder="Можно добавить сертификаты, особенности графика, ограничения или важные детали."
                  />
                </label>
              </div>
            </section>

            <label className={styles.consentRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span className={styles.consentText}>
                Я согласен на обработку персональных данных.{' '}
                <a href="/docs/personal-data-agreement.pdf" download>
                  Скачать документ
                </a>
              </span>
            </label>

            {error ? <div className={styles.error}>{error}</div> : null}

            {success ? (
              <div className={styles.success}>
                Заявка отправлена и передана администраторам на проверку.
                <div className={styles.successLinkWrap}>
                  <Link to="/become-specialist" className={styles.link}>
                    Вернуться на страницу “Стать специалистом”
                  </Link>
                </div>
              </div>
            ) : null}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading || !canSubmit}
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
