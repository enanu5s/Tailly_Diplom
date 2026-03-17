// src/features/specialists-search/data/mockSpecialistsGeo.ts

export type GeoPoint = {
  lon: number;
  lat: number;
};

export type GeoSuggestItem = {
  name: string;
  fullName: string;
  point: GeoPoint | null;
  type: string | null;
};

export type SuggestResponseItem = {
  name?: string;
  full_name?: string;
  type?: string;
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
      name: item.name ?? '',
      fullName: item.full_name ?? item.name ?? '',
      type: item.type ?? null,
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
    const key = `${item.name}::${item.fullName}::${item.type ?? ''}`;

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