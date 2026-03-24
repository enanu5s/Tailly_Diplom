// src/features/specialists-search/data/mockSpecialistsGeo.ts

export type GeoPoint = {
  lon: number;
  lat: number;
};

export type GeoSuggestItem = {
  /** Идентификатор объекта в каталоге 2GIS, если пришёл в ответе */
  id: string | null;
  name: string;
  fullName: string;
  point: GeoPoint | null;
  type: string | null;
  /** У 2GIS в suggests часто type=adm_div, вид НП задаёт subtype: city | settlement | place */
  subtype: string | null;
};

/** Населённые пункты (город, посёлок, населённый пункт) — не районы и не улицы */
const LOCALITY_ADM_DIV_TYPES = new Set([
  'adm_div.city',
  'adm_div.settlement',
  'adm_div.place',
]);

const LOCALITY_ADM_DIV_SUBTYPES = new Set(['city', 'settlement', 'place']);

/** Подсказка относится к населённому пункту (не район, не улица и т.д.) */
export function isLocalitySuggestItem(
  item: Pick<GeoSuggestItem, 'type' | 'subtype'>,
): boolean {
  if (item.type !== null && LOCALITY_ADM_DIV_TYPES.has(item.type)) {
    return true;
  }

  return (
    item.type === 'adm_div' &&
    item.subtype !== null &&
    LOCALITY_ADM_DIV_SUBTYPES.has(item.subtype)
  );
}

export type SuggestResponseItem = {
  id?: string;
  name?: string;
  full_name?: string;
  type?: string;
  subtype?: string;
  point?: {
    lon?: number;
    lat?: number;
  };
};

export type SuggestResponse = {
  meta?: {
    code?: number;
  };
  result?: {
    items?: SuggestResponseItem[];
  };
};

export type GeocodeResponse = {
  result?: {
    items?: Array<{
      point?: {
        lon?: number;
        lat?: number;
      };
    }>;
  };
};

export function normalizeSuggestItems(
  items: SuggestResponseItem[] = [],
): GeoSuggestItem[] {
  return items.map((item) => {
    const lon = item.point?.lon;
    const lat = item.point?.lat;

    return {
      id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : null,
      name: item.name ?? '',
      fullName: item.full_name ?? item.name ?? '',
      type: item.type ?? null,
      subtype:
        typeof item.subtype === 'string' && item.subtype.trim()
          ? item.subtype.trim()
          : null,
      point:
        typeof lon === 'number' && typeof lat === 'number'
          ? { lon, lat }
          : null,
    };
  });
}

export function dedupeSuggestItems(
  items: GeoSuggestItem[],
): GeoSuggestItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.id ?? ''}::${item.name}::${item.fullName}::${item.type ?? ''}::${item.subtype ?? ''}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildDirect2GisUrl(
  path: string,
  params: URLSearchParams,
): string {
  return `https://catalog.api.2gis.com${path}?${params.toString()}`;
}

/** Стабильный идентификатор для выбранного НП, если в ответе 2GIS нет `id` */
export function buildLocalityFallbackId(item: GeoSuggestItem): string {
  if (item.id) {
    return item.id;
  }

  const lon = item.point?.lon ?? '';
  const lat = item.point?.lat ?? '';
  const label = item.fullName || item.name || '';

  return `2gis_loc:${item.type ?? ''}:${item.subtype ?? ''}:${lon}:${lat}:${label}`;
}