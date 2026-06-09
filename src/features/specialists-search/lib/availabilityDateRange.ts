/**
 * Проверка: есть ли хотя бы один день в диапазоне [from, to],
 * попадающий на один из дней недели `weekdays` (0=вс … 6=сб, как у Date.getDay()).
 */
export function dateRangeIntersectsWeekdays(
  fromIso: string | null,
  toIso: string | null,
  weekdays: Set<number>,
): boolean {
  if (weekdays.size === 0) {
    return false;
  }

  if (!fromIso && !toIso) {
    return true;
  }

  let from = fromIso ? parseDateOnly(fromIso) : null;
  let to = toIso ? parseDateOnly(toIso) : null;

  if (from && !to) {
    to = from;
  }
  if (!from && to) {
    from = to;
  }

  if (!from || !to) {
    return true;
  }

  if (from.getTime() > to.getTime()) {
    const swap = from;
    from = to;
    to = swap;
  }

  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  while (cur.getTime() <= end.getTime()) {
    if (weekdays.has(cur.getDay())) {
      return true;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return false;
}

function parseDateOnly(iso: string): Date {
  const parts = iso.trim().split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (
    y === undefined ||
    m === undefined ||
    d === undefined ||
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  ) {
    return new Date(NaN);
  }
  return new Date(y, m - 1, d);
}
