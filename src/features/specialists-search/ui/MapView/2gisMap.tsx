//src/features/specialists-search/ui/MapView/2gisMap.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

import { load2GisMaps } from '@/shared/lib/2gis/loader';

import styles from './2gisMap.module.css';
import { specialistsGeoService } from '../../service/specialistsGeoService';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';

type Props = {
  store: SpecialistsSearchStore;
  onOpenSpecialist: (id: string) => void;
};

type MapGLModule = Awaited<ReturnType<typeof load2GisMaps>>;
type MapInstance = InstanceType<MapGLModule['Map']>;
type MarkerInstance = InstanceType<MapGLModule['Marker']>;

const MOSCOW_CENTER: [number, number] = [37.6173, 55.7558];
const DEFAULT_ZOOM = 11;
const CITY_ZOOM = 12;
const DISTRICT_ZOOM = 14;

export const GisMap = observer(({ store, onOpenSpecialist }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<MapInstance | null>(null);
  const mapglRef = useRef<MapGLModule | null>(null);
  const markersRef = useRef<MarkerInstance[]>([]);
  const geocodeRequestIdRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const cityQuery = store.filters.cityQuery.trim();
  const districtQuery = store.filters.districtQuery.trim();

  useEffect(() => {
    let destroyed = false;

    async function initMap() {
      if (!containerRef.current) {
        return;
      }

      setLoadError(null);

      try {
        const mapgl = await load2GisMaps();

        if (destroyed || !containerRef.current) {
          return;
        }

        const apiKey = import.meta.env.VITE_2GIS_API_KEY ?? '';

        if (!apiKey) {
          throw new Error('VITE_2GIS_API_KEY is not set');
        }

        const map = new mapgl.Map(containerRef.current, {
          center: MOSCOW_CENTER,
          zoom: DEFAULT_ZOOM,
          key: apiKey,
        });

        mapRef.current = map;
        mapglRef.current = mapgl;

        const updateBounds = () => {
          const bounds = map.getBounds();

          if (!bounds) {
            return;
          }

          const sw = bounds.southWest;
          const ne = bounds.northEast;

          if (
            !Array.isArray(sw) ||
            !Array.isArray(ne) ||
            sw.length < 2 ||
            ne.length < 2
          ) {
            return;
          }

          store.setMapBounds({
            sw: {
              lat: sw[1],
              lon: sw[0],
            },
            ne: {
              lat: ne[1],
              lon: ne[0],
            },
          });
        };

        map.on('moveend', updateBounds);
        updateBounds();

        setReady(true);
      } catch (error) {
        console.error('Ошибка инициализации 2GIS карты:', error);
        setLoadError('Не удалось загрузить карту');
        setReady(false);
      }
    }

    void initMap();

    return () => {
      destroyed = true;

      markersRef.current.forEach((marker) => {
        try {
          marker.destroy();
        } catch {
          // ignore
        }
      });
      markersRef.current = [];

      try {
        mapRef.current?.destroy();
      } catch {
        // ignore
      }

      mapRef.current = null;
      mapglRef.current = null;
      setReady(false);
    };
  }, [store]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const map = mapRef.current;

    if (!map) {
      return;
    }

    const hasCity = cityQuery.length > 0;
    const hasDistrict = districtQuery.length > 0;

    if (!hasCity && !hasDistrict) {
      map.setCenter(MOSCOW_CENTER, { duration: 600 });
      map.setZoom(DEFAULT_ZOOM, { duration: 600 });
      return;
    }

    const requestId = ++geocodeRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const locationQuery =
          hasCity && hasDistrict
            ? `${cityQuery}, ${districtQuery}`
            : hasCity
              ? cityQuery
              : districtQuery;

        const point = await specialistsGeoService.geocodeLocation(locationQuery);

        if (requestId !== geocodeRequestIdRef.current) {
          return;
        }

        if (!point) {
          return;
        }

        map.setCenter([point.lon, point.lat], { duration: 600 });

        map.setZoom(hasDistrict ? DISTRICT_ZOOM : CITY_ZOOM, { duration: 600 });
      } catch (error) {
        console.error('Ошибка геокодирования локации для карты:', error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cityQuery, districtQuery, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const map = mapRef.current;
    const mapgl = mapglRef.current;

    if (!map || !mapgl) {
      return;
    }

    markersRef.current.forEach((marker) => {
      try {
        marker.destroy();
      } catch {
        // ignore
      }
    });
    markersRef.current = [];

    const nextMarkers = store.filtered
      .filter((specialist) => {
        return (
          typeof specialist.location?.lon === 'number' &&
          typeof specialist.location?.lat === 'number'
        );
      })
      .map((specialist) => {
        const marker = new mapgl.Marker(map, {
          coordinates: [specialist.location.lon, specialist.location.lat],
        });

        marker.on('click', () => {
          onOpenSpecialist(specialist.id);
        });

        return marker;
      });

    markersRef.current = nextMarkers;
  }, [ready, store.filtered, onOpenSpecialist]);

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={styles.map} />

      {loadError ? (
        <div className={styles.fallback}>{loadError}</div>
      ) : null}
    </div>
  );
});