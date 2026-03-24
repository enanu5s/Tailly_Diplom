//src/shared/lib/navigation/RouteViewportManager.tsx

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { buildRouteKey, getScrollPosition, saveScrollPosition } from './routeMemory';

export function RouteViewportManager(): null {
  const location = useLocation();
  const navigationType = useNavigationType();

  const routeKey = useMemo(() => buildRouteKey(location), [location]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return;
    }

    const previousValue = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousValue;
    };
  }, []);

  useEffect(() => {
    const persistScroll = (): void => {
      saveScrollPosition(routeKey, window.scrollY);
    };

    persistScroll();

    window.addEventListener('scroll', persistScroll, { passive: true });
    window.addEventListener('beforeunload', persistScroll);

    return () => {
      persistScroll();
      window.removeEventListener('scroll', persistScroll);
      window.removeEventListener('beforeunload', persistScroll);
    };
  }, [routeKey]);

  useLayoutEffect(() => {
    const savedScrollY = navigationType === 'POP' ? getScrollPosition(routeKey) : null;

    if (savedScrollY !== null) {
      window.scrollTo({
        top: savedScrollY,
        left: 0,
        behavior: 'auto',
      });
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [navigationType, routeKey]);

  return null;
}
