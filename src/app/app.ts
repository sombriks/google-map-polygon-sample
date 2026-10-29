import { Component, output, resource, signal } from '@angular/core';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import GeocoderResult = google.maps.GeocoderResult;

interface GoogleKeyConfig {
  key?: string;
  apiKey?: string;
}

interface LatLng {
  lat: number;
  lng: number;
}

@Component({
  imports: [GoogleMap, MatIcon, MatFabButton, MapAdvancedMarker],
  selector: 'app-root',
  styles: `
    .mapa
      display: grid
      grid-template-columns: 2fr 1fr
      //grid-template-rows: 1fr
      min-height: 100%

    google-map
      min-height: 480px

    fieldset
      div
        display: grid
        grid-template-columns: 1fr 50px
        //grid-template-rows: 1fr
        gap: 15px
        .erro
          grid-column: span 2
          color: var(--mat-sys-error)
  `,
  template: `
    <div class="mapa">
      @if (mapsApi.isLoading()) {
        <p>Carregando Google Maps...</p>
      } @else if (mapsApi.error()) {
        <p>Erro ao carregar mapa: {{ mapsApi.error() }}</p>
      } @else if (mapsApi.hasValue()) {
        <google-map
          (mapClick)="updateCoords($event)"
          [center]="center()"
          [zoom]="zoom()"
          height="100%"
          width="100%"
          mapId="m"
        >
          <map-advanced-marker [position]="coords()" />
        </google-map>
      }
      <fieldset>
        <legend>Geocoding</legend>
        <div>
          <input
            (input)="address.set($any($event.target).value)"
            (keydown.enter)="query(address()?.trim())"
            [value]="address()"
          />
          <button matFab (click)="query(address().trim())">
            <mat-icon>search</mat-icon>
          </button>
          <div class="erro">{{ err() }}</div>
        </div>
      </fieldset>
    </div>
  `,
})
export class App {
  protected readonly zoom = signal(13);
  protected readonly center = signal<LatLng>({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly coords = signal<LatLng>({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly address = signal('');
  protected readonly err = signal('');

  readonly addrChange = output<GeocoderResult>();

  protected readonly mapsApi = resource({
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
      setOptions({
        key: apiKey,
        v: 'weekly',
      });
      await Promise.all([importLibrary('maps'), importLibrary('geocoding')]);
      return true;
    },
  });

  protected async updateCoords(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    if (!event.latLng) {
      return;
    }
    const location = event.latLng.toJSON();
    this.coords.set(location);
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ location });
    if (!response.results.length) {
      this.err.set('Endereço não encontrado.');
      return;
    }
    const best = response.results[0];
    this.address.set(best.formatted_address);
    this.addrChange.emit(best);
  }

  protected async query(address: string) {
    if (!address) {
      this.err.set('Informe um endereço.');
      return;
    }
    this.err.set('');
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ address });
    if (!response.results.length) {
      this.err.set('Endereço não encontrado.');
      return;
    }
    const best = response.results[0];
    const location = best.geometry.location.toJSON();
    this.coords.set(location);
    this.center.set(location);
    this.address.set(best.formatted_address);
    this.addrChange.emit(best);
  }
}
