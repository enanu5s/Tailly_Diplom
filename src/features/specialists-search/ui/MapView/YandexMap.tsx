import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';
import { loadYandexMaps } from '@/shared/lib/yandexMaps/loader';
import styles from './YandexMap.module.css';

type Props = {
  store: SpecialistsSearchStore;
  onOpenSpecialist: (id: string) => void;
};

export const YandexMap = observer(({ store, onOpenSpecialist }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const ymRef = useRef<any>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!containerRef.current) return;

      const ym = await loadYandexMaps();
      await ym.ready();

      if (destroyed) return;

      ymRef.current = ym;

      const q = store.filters.cityQuery.trim().toLowerCase();

      const center = q.includes('юрмала')
        ? [56.968, 23.77]
        : q.includes('рига')
          ? [56.9496, 24.1052]
          : [55.7558, 37.6173];

      const map = new ym.Map(containerRef.current, {
        center,
        zoom: 11,
        controls: ['zoomControl'],
      });

      mapRef.current = map;

      const updateBounds = () => {
        const b = map.getBounds();
        if (!b) return;
        const [[swLat, swLon], [neLat, neLon]] = b;

        store.setMapBounds({
          sw: { lat: swLat, lon: swLon },
          ne: { lat: neLat, lon: neLon },
        });
      };

      map.events.add('boundschange', updateBounds);
      updateBounds();

      setReady(true);
    }

    init().catch(() => setReady(false));

    return () => {
      destroyed = true;
      try {
        mapRef.current?.destroy?.();
      } catch {
        // ignore
      }
      mapRef.current = null;
      ymRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // маркеры специалистов
  useEffect(() => {
    if (!ready) return;

    const map = mapRef.current;
    const ym = ymRef.current;
    if (!map || !ym) return;

    map.geoObjects.removeAll();

    store.filtered.forEach((sp) => {
      const placemark = new ym.Placemark(
        [sp.location.lat, sp.location.lon],
        {
          balloonContent: `
            <div class="${styles.balloon}">
              <div class="${styles.balloonTitle}">${sp.name}</div>
              <div class="${styles.balloonMeta}">${sp.city}, ${sp.district}</div>
              <button id="open-${sp.id}" class="${styles.balloonBtn}">Открыть профиль</button>
            </div>
          `,
        },
        { preset: 'islands#violetIcon' },
      );

      placemark.events.add('balloonopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`open-${sp.id}`);
          if (btn) btn.onclick = () => onOpenSpecialist(sp.id);
        }, 0);
      });

      map.geoObjects.add(placemark);
    });
  }, [ready, store.filtered.length, onOpenSpecialist, store]);

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={styles.map} />
      {!ready && <div className={styles.fallback}>Не удалось загрузить карту</div>}
    </div>
  );
});