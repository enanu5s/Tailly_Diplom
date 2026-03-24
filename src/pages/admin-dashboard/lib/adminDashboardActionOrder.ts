// src/pages/admin-dashboard/lib/adminDashboardActionOrder.ts

export type AdminDashboardActionId =
  | 'moderation'
  | 'users'
  | 'posts'
  | 'superAdmins'
  | 'passwordRecovery';

type ScoredAction<T extends { id: AdminDashboardActionId }> = T & { _score: number };

function normalizeHaystack(position?: string, department?: string): string {
  return `${position ?? ''} ${department ?? ''}`.trim().toLowerCase();
}

/**
 * Чем выше значение — тем раньше блок должен идти в списке.
 * Учитываются должность и отдел (как в карточке администратора).
 */
export function scoreAdminDashboardAction(
  id: AdminDashboardActionId,
  position: string | undefined,
  department: string | undefined,
  isSuperAdmin: boolean,
): number {
  if ((id === 'superAdmins' || id === 'passwordRecovery') && !isSuperAdmin) {
    return -1;
  }

  const hay = normalizeHaystack(position, department);
  let score = 0;

  type Rule = { ids: AdminDashboardActionId[]; test: (h: string) => boolean; w: number };

  const rules: Rule[] = [
    {
      ids: ['users'],
      test: (h) => h.includes('поддержк'),
      w: 14,
    },
    {
      ids: ['moderation', 'users'],
      test: (h) => h.includes('поддержк'),
      w: 6,
    },
    {
      ids: ['posts'],
      test: (h) =>
        h.includes('маркетинг') ||
        h.includes('контент') ||
        h.includes('smm') ||
        h.includes('медиа'),
      w: 16,
    },
    {
      ids: ['posts', 'moderation'],
      test: (h) => h.includes('редактор') || h.includes('публикац'),
      w: 10,
    },
    {
      ids: ['moderation'],
      test: (h) =>
        h.includes('модерац') ||
        h.includes('кадр') ||
        h.includes('hr') ||
        h.includes('верификац') ||
        h.includes('специалист'),
      w: 12,
    },
    {
      ids: ['users'],
      test: (h) =>
        h.includes('пользовател') ||
        h.includes('клиент') ||
        h.includes('сервис') ||
        h.includes('консультац'),
      w: 8,
    },
    {
      ids: ['superAdmins', 'passwordRecovery'],
      test: (h) =>
        h.includes('администрац') ||
        h.includes('главн') ||
        h.includes('руковод') ||
        h.includes('организац'),
      w: 11,
    },
    {
      ids: ['passwordRecovery', 'users'],
      test: (h) =>
        h.includes('безопасност') ||
        h.includes('it-') ||
        h.includes(' it') ||
        h.includes('информационн') ||
        h.includes('кибер'),
      w: 9,
    },
    {
      ids: ['passwordRecovery'],
      test: (h) => h.includes('парол') || h.includes('восстановлен') || h.includes('доступ'),
      w: 7,
    },
    {
      ids: ['superAdmins'],
      test: (h) => h.includes('персонал') || h.includes('штат') || h.includes('управлен'),
      w: 8,
    },
  ];

  for (const rule of rules) {
    if (!rule.ids.includes(id)) {
      continue;
    }

    if (rule.test(hay)) {
      score += rule.w;
    }
  }

  const keywordExtra: Record<AdminDashboardActionId, readonly string[]> = {
    moderation: ['модерац', 'анкет', 'заявк', 'верификац'],
    users: ['пользовател', 'клиент', 'блокиров'],
    posts: ['пост', 'баннер', 'публикац', 'контент'],
    superAdmins: ['кадры', 'персонал', 'руковод'],
    passwordRecovery: ['парол', 'восстановлен', 'учётн'],
  };

  for (const kw of keywordExtra[id]) {
    if (hay.includes(kw)) {
      score += 2;
    }
  }

  return score;
}

const DEFAULT_ORDER_NON_SUPER: AdminDashboardActionId[] = [
  'moderation',
  'users',
  'posts',
];

const DEFAULT_ORDER_SUPER: AdminDashboardActionId[] = [
  'superAdmins',
  'passwordRecovery',
  'moderation',
  'users',
  'posts',
];

function defaultOrderIndex(id: AdminDashboardActionId, isSuperAdmin: boolean): number {
  const order = isSuperAdmin ? DEFAULT_ORDER_SUPER : DEFAULT_ORDER_NON_SUPER;
  const idx = order.indexOf(id);

  return idx === -1 ? order.length : idx;
}

export function sortAdminDashboardActions<T extends { id: AdminDashboardActionId }>(
  actions: T[],
  position: string | undefined,
  department: string | undefined,
  isSuperAdmin: boolean,
): T[] {
  const scored: ScoredAction<T>[] = actions.map((item) => ({
    ...item,
    _score: scoreAdminDashboardAction(item.id, position, department, isSuperAdmin),
  }));

  scored.sort((a, b) => {
    if (b._score !== a._score) {
      return b._score - a._score;
    }

    return (
      defaultOrderIndex(a.id, isSuperAdmin) - defaultOrderIndex(b.id, isSuperAdmin)
    );
  });

  return scored.map((item) => {
    const { _score, ...rest } = item;
    void _score;
    return rest as T;
  });
}
