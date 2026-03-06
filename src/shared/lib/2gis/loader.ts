//src/shared/lib/2gis/loader.ts

import { load } from '@2gis/mapgl';

type MapGLModule = Awaited<ReturnType<typeof load>>;

let loadingPromise: Promise<MapGLModule> | null = null;

export function load2GisMaps(): Promise<MapGLModule> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('2GIS MapGL can be loaded only in browser'));
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = load();

  return loadingPromise;
}