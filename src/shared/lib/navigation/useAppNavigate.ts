import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { createNavigationState } from './routeMemory';

import type { NavigateOptions, To } from 'react-router-dom';

type AppNavigateOptions = NavigateOptions & {
  preserveRouteMemory?: boolean;
};

type AppNavigateFunction = {
  (to: To, options?: AppNavigateOptions): void;
  (delta: number): void;
};

export function useAppNavigate(): AppNavigateFunction {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: To | number, options?: AppNavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      const preserveRouteMemory = options?.preserveRouteMemory ?? true;

      navigate(to, {
        ...options,
        state: preserveRouteMemory
          ? createNavigationState(location, options?.state)
          : options?.state,
      });
    },
    [location, navigate],
  ) as AppNavigateFunction;
}
