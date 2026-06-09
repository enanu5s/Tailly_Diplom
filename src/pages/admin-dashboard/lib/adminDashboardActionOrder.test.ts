import { describe, expect, it } from 'vitest';

import {
  scoreAdminDashboardAction,
  sortAdminDashboardActions,
} from './adminDashboardActionOrder';

describe('scoreAdminDashboardAction', () => {
  it('для superAdmins и passwordRecovery без флага супера возвращает -1', () => {
    expect(scoreAdminDashboardAction('superAdmins', 'Админ', undefined, false)).toBe(
      -1,
    );
    expect(scoreAdminDashboardAction('passwordRecovery', 'IT', undefined, false)).toBe(
      -1,
    );
  });

  it('те же id разрешены для суперадмина', () => {
    expect(scoreAdminDashboardAction('superAdmins', 'x', undefined, true)).toBeGreaterThan(
      -1,
    );
  });

  it('маркетинг повышает вес posts', () => {
    const m = scoreAdminDashboardAction('posts', 'Маркетолог', 'маркетинг', false);
    const plain = scoreAdminDashboardAction('posts', 'x', 'y', false);
    expect(m).toBeGreaterThan(plain);
  });
});

describe('sortAdminDashboardActions', () => {
  const actions = [
    { id: 'posts' as const, label: 'Посты' },
    { id: 'moderation' as const, label: 'Модерация' },
    { id: 'users' as const, label: 'Пользователи' },
  ];

  it('сортирует по убыванию score', () => {
    const sorted = sortAdminDashboardActions(
      actions,
      'Специалист по модерации анкет',
      'HR',
      false,
    );
    expect(sorted[0]?.id).toBe('moderation');
  });

  it('при равном score сохраняет порядок по умолчанию (moderation, users, posts)', () => {
    const sorted = sortAdminDashboardActions(actions, 'x', 'y', false);
    expect(sorted.map((a) => a.id)).toEqual(['moderation', 'users', 'posts']);
  });
});
