// src/pages/specialist-calendar-edit/ui/CalendarDayContextMenu.tsx

import { useMemo, type ReactElement } from 'react';

import styles from './CalendarDayContextMenu.module.css';

export type CalendarDayMenuItem = {
  id: string;
  label: string;
  hint?: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
};

type Props = {
  anchor: { clientX: number; clientY: number } | null;
  items: CalendarDayMenuItem[];
  title?: string;
  onRequestClose: () => void;
};

const MENU_MARGIN_PX = 8;
/** Оценка ширины без измерения DOM (см. max-width в CSS). */
const MENU_EST_WIDTH_PX = 280;

function estimateMenuHeightPx(itemCount: number, hasTitle: boolean): number {
  const titleBlock = hasTitle ? 36 : 0;
  const row = 52;
  const padding = 16;

  return titleBlock + itemCount * row + padding;
}

function clampMenuPosition(
  clientX: number,
  clientY: number,
  estWidth: number,
  estHeight: number,
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.max(
    MENU_MARGIN_PX,
    Math.min(clientX, vw - estWidth - MENU_MARGIN_PX),
  );
  const top = Math.max(
    MENU_MARGIN_PX,
    Math.min(clientY, vh - estHeight - MENU_MARGIN_PX),
  );

  return { left, top };
}

export function CalendarDayContextMenu({
  anchor,
  items,
  title,
  onRequestClose,
}: Props): ReactElement | null {
  const positionStyle = useMemo(() => {
    if (!anchor) {
      return null;
    }

    const estH = estimateMenuHeightPx(items.length, Boolean(title));
    const { left, top } = clampMenuPosition(
      anchor.clientX,
      anchor.clientY,
      MENU_EST_WIDTH_PX,
      estH,
    );

    return { left: `${left}px`, top: `${top}px` };
  }, [anchor, items.length, title]);

  if (!anchor || !positionStyle) {
    return null;
  }

  return (
    <div
      className={styles.root}
      data-calendar-context-menu
      style={positionStyle}
      role="menu"
      aria-label="Действия с днём"
    >
      {title ? <div className={styles.title}>{title}</div> : null}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.item} ${
                item.tone === 'danger' ? styles.itemDanger : ''
              }`}
              role="menuitem"
              onClick={() => {
                item.onSelect();
                onRequestClose();
              }}
            >
              <span className={styles.itemLabel}>{item.label}</span>
              {item.hint ? (
                <span className={styles.itemHint}>{item.hint}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
