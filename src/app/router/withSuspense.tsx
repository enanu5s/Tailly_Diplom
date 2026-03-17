// src/app/router/withSuspense.tsx

import { Suspense, type ReactNode } from 'react';

import { RouteLoader } from '@/shared/ui/loaders/RouteLoader';

export function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>;
}