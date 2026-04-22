import { useSyncExternalStore } from 'react';

import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import styles from './MockDataBadge.module.css';

export function MockDataBadge() {
  const sourceState = useSyncExternalStore(
    mockDataSourceStore.subscribe,
    mockDataSourceStore.getState,
  );

  const activeSources = Object.entries(sourceState)
    .filter((entry) => entry[1])
    .map((entry) => entry[0]);

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <div className={styles.badge} role="status" aria-live="polite">
      Данные из mock: {activeSources.join(', ')}
    </div>
  );
}
