//src/shared/ui/back-button/BackButton.tsx

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import type { ReactElement, ReactNode } from 'react';
import type { To } from 'react-router-dom';

type BackButtonLocationState = {
  from?: To;
};

type Props = {
  fallbackTo: To;
  label?: string;
  className?: string;
  replace?: boolean;
  disabled?: boolean;
  state?: Record<string, unknown>;
  children?: ReactNode;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidToObject(value: unknown): value is To {
  if (!isPlainObject(value)) {
    return false;
  }

  const pathname = value.pathname;
  const search = value.search;
  const hash = value.hash;

  const isPathnameValid =
    pathname === undefined || typeof pathname === 'string';
  const isSearchValid = search === undefined || typeof search === 'string';
  const isHashValid = hash === undefined || typeof hash === 'string';

  return isPathnameValid && isSearchValid && isHashValid;
}

function resolveBackTarget(state: unknown, fallbackTo: To): To {
  if (!isPlainObject(state)) {
    return fallbackTo;
  }

  const maybeState = state as BackButtonLocationState;
  const from = maybeState.from;

  if (typeof from === 'string') {
    return from;
  }

  if (isValidToObject(from)) {
    return from;
  }

  return fallbackTo;
}

export function BackButton({
  fallbackTo,
  label = '← Назад',
  className,
  replace = false,
  disabled = false,
  state,
  children,
}: Props): ReactElement {
  const navigate = useAppNavigate();
  const location = useLocation();

  const target = useMemo<To>(() => {
    return resolveBackTarget(location.state, fallbackTo);
  }, [fallbackTo, location.state]);

  const handleClick = (): void => {
    if (disabled) {
      return;
    }

    navigate(target, {
      replace,
      state,
    });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children ?? label}
    </button>
  );
}