import { Component, inject, input, output, signal } from '@angular/core';
import { AppMapaService } from './app-mapa.service';
import { MapCoords } from './app-mapa.model';
import GeocoderResult = google.maps.GeocoderResult;
import MapMouseEvent = google.maps.MapMouseEvent;
import IconMouseEvent = google.maps.IconMouseEvent;
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';

@Component({
  selector: 'app-mapa',
  styles: `
    google-map
      min-height: 480px
  `,
  template: `
    @if (service.mapsApi.isLoading()) {
      <p>Carregando Google Maps...</p>
    } @else if (service.mapsApi.error()) {
      <p>Erro ao carregar mapa: {{ service.mapsApi.error() }}</p>
    } @else if (service.mapsApi.hasValue()) {
      <google-map
        (mapClick)="updateCoords($event)"
        [center]="center()"
        [mapId]="mapId()"
        [zoom]="zoom()"
        height="100%"
        width="100%"
      >
        <map-advanced-marker [position]="coords()" />
      </google-map>
    }
  `,
  imports: [GoogleMap, MapAdvancedMarker],
})
export class AppMapaComponent {
  protected readonly service = inject(AppMapaService);

  readonly mapChange = output<GeocoderResult>();

  protected readonly center = signal<MapCoords>({ ...this.service.ORIGEM });
  protected readonly zoom = signal(this.service.ZOOM);

  readonly mapId = input.required<string>();
  readonly coords = input<MapCoords, MapCoords>(
    { ...this.service.ORIGEM },
    {
      transform: (c: MapCoords) => {
        this.center.set(c);
        return c;
      },
    },
  );

  protected async updateCoords(event: MapMouseEvent | IconMouseEvent) {
    if (!event.latLng) return;
    const result = await this.service.geocodeLatLng(event.latLng);
    this.mapChange.emit(result);
  }
}
