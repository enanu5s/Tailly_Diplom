// src/pages/register-client-verify/ui/RegisterClientVerifyPage.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useClientRegistrationStore } from '@/features/registration-client/model/store';
import styles from './RegisterClientVerifyPage.module.css';

export default function RegisterClientVerifyPage() {
  const navigate = useNavigate();
  const { data, setData } = useClientRegistrationStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      alert('Код должен состоять из 6 цифр');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register/client/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, code }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Неверный код');

      // Сохраняем токен, если сервер его возвращает
      if (result.token) setData({ verificationToken: result.token });

      alert('Почта успешно подтверждена!');
      navigate('/register/client/profile');

    } catch (err: any) {
      alert(err.message || 'Ошибка проверки кода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← Вернуться назад
          </button>

          <h1 className={styles.title}>Подтверждение почты</h1>
          <p className={styles.subtitle}>
            Мы отправили 6-значный код на {data.email}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={styles.codeInput}
              autoFocus
            />

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Проверяем...' : 'Подтвердить код'}
            </button>
          </form>

          <p className={styles.resend}>
            Не пришёл код?{' '}
            <button type="button" className={styles.resendLink} onClick={() => alert('Повторная отправка (заглушка)')}>
              Отправить повторно
            </button>
          </p>
        </div>
      </div>
    </>
  );
}