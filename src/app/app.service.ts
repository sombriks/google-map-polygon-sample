import { Injectable, resource } from '@angular/core';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
// os types não dependem do carregamento dinâmico da biblioteca
import GeocoderResult = google.maps.GeocoderResult;
import LatLng =  google.maps.LatLng;

interface GoogleKeyConfig {
  key?: string;
  apiKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppsService {
  readonly mapsApi = resource({
    loader: async ({ abortSignal }) => {
      const response = await fetch('/gkey.json', { signal: abortSignal });
      if (!response.ok) {
        throw new Error(`Falha ao buscar gkey.json (${response.statusText})`);
      }
      const config: GoogleKeyConfig = await response.json();
      const apiKey = config.key ?? config.apiKey;
      if (!apiKey) {
        throw new Error('Chave de API não encontrada em gkey.json');
      }
      setOptions({ key: apiKey, v: 'weekly' });
      await Promise.all([importLibrary('maps'), importLibrary('geocoding')]);
      return true;
    },
  });

  async geocodeLatLng(latLng?: LatLng | null): Promise<GeocoderResult> {
    if (!latLng) {
      throw new Error('Coordenadas inválidas.');
    }

    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ location: latLng.toJSON?.() });

    if (!response.results || response.results.length === 0) {
      throw new Error('Endereço não encontrado para estas coordenadas.');
    }

    return response.results[0];
  }

  async geocodeAddress(address: string): Promise<GeocoderResult> {
    const trimmed = address?.trim();
    if (!trimmed) {
      throw new Error('Informe um endereço.');
    }

    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ address: trimmed });

    if (!response.results || response.results.length === 0) {
      throw new Error('Endereço não encontrado.');
    }

    return response.results[0];
  }
}
