// src/pages/specialist-calendar-edit/ui/useCalendarDayPointerMenu.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

const LONG_PRESS_MS = 550;
const MOVE_THRESHOLD_PX = 12;

export type CalendarDayMenuAnchor = {
  isoDate: string;
  clientX: number;
  clientY: number;
};

export function useCalendarDayPointerMenu(): {
  menuAnchor: CalendarDayMenuAnchor | null;
  openMenuAt: (isoDate: string, clientX: number, clientY: number) => void;
  closeMenu: () => void;
  suppressNextClickRef: MutableRefObject<boolean>;
  getDayCellPointerProps: (
    isoDate: string,
    options: { disabled: boolean },
  ) => {
    onContextMenu: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchMove: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
  };
} {
  const [menuAnchor, setMenuAnchor] = useState<CalendarDayMenuAnchor | null>(null);
  const suppressNextClickRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; iso: string } | null>(null);

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const openMenuAt = useCallback((isoDate: string, clientX: number, clientY: number) => {
    setMenuAnchor({
      isoDate,
      clientX,
      clientY,
    });
  }, []);

  const clearLongPressTimer = useCallback((): void => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!menuAnchor) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent): void => {
      const target = event.target;

      if (target instanceof Node && target.nodeType === Node.ELEMENT_NODE) {
        const el = target as Element;

        if (el.closest('[data-calendar-context-menu]')) {
          return;
        }
      }

      closeMenu();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [menuAnchor, closeMenu]);

  const getDayCellPointerProps = useCallback(
    (isoDate: string, options: { disabled: boolean }) => {
      const { disabled } = options;

      return {
        onContextMenu: (event: React.MouseEvent): void => {
          if (disabled) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          openMenuAt(isoDate, event.clientX, event.clientY);
        },

        onTouchStart: (event: React.TouchEvent): void => {
          if (disabled) {
            return;
          }

          const touch = event.touches[0];

          if (!touch) {
            return;
          }

          touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            iso: isoDate,
          };

          clearLongPressTimer();

          longPressTimerRef.current = setTimeout(() => {
            longPressTimerRef.current = null;
            touchStartRef.current = null;

            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(12);
              } catch {
                // ignore
              }
            }

            suppressNextClickRef.current = true;
            openMenuAt(isoDate, touch.clientX, touch.clientY);
          }, LONG_PRESS_MS);
        },

        onTouchMove: (event: React.TouchEvent): void => {
          const start = touchStartRef.current;
          const touch = event.touches[0];

          if (!start || !touch) {
            return;
          }

          const dx = Math.abs(touch.clientX - start.x);
          const dy = Math.abs(touch.clientY - start.y);

          if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
            touchStartRef.current = null;
            clearLongPressTimer();
          }
        },

        onTouchEnd: (): void => {
          touchStartRef.current = null;
          clearLongPressTimer();
        },
      };
    },
    [clearLongPressTimer, openMenuAt],
  );

  return {
    menuAnchor,
    openMenuAt,
    closeMenu,
    suppressNextClickRef,
    getDayCellPointerProps,
  };
}
