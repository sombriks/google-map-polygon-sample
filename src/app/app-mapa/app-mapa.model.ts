export interface GoogleKeyConfig {
  key?: string;
}

export interface MapCoords {
  lat: number;
  lng: number;
}

export interface MapPoly {
  lat: number[];
  lng: number[];
}

export function coordsToPoly(coords: MapCoords[]): MapPoly {
  return {
    lat: coords?.map((coord) => coord.lat) ?? [],
    lng: coords?.map((coord) => coord.lng) ?? [],
  };
}

export function polyToCoords(poly: MapPoly): MapCoords[] {
  if (!poly?.lat?.length) return [];
  return poly.lat.map((lat, index) => ({
    lat,
    lng: poly.lng[index],
  }));
}
