import { Component, inject, input, output, signal } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolygon } from '@angular/google-maps';
import { AppMapaService } from './app-mapa.service';
import { MapCoords, MapPoly, polyToCoords } from './app-mapa.model';
import GeocoderResult = google.maps.GeocoderResult;
import MapMouseEvent = google.maps.MapMouseEvent;
import IconMouseEvent = google.maps.IconMouseEvent;
import PolyMouseEvent = google.maps.PolyMouseEvent;

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
        <map-advanced-marker
          (mapDragend)="updateCoords($event)"
          [gmpDraggable]="editMode()"
          [position]="coords()"
        />
        @if (poly().length > 0) {
          <map-polygon (polygonClick)="updateCoords($event)" [paths]="poly()" />
          @if(editMode()) {
            
          }
        }
      </google-map>
    }
  `,
  imports: [GoogleMap, MapAdvancedMarker, MapPolygon],
})
export class AppMapaComponent {
  protected readonly service = inject(AppMapaService);

  readonly mapChange = output<GeocoderResult>();

  protected readonly center = signal<MapCoords>({ ...this.service.ORIGEM });
  protected readonly poly = signal<MapCoords[]>([]);
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
  readonly polygon = input<MapCoords[], MapPoly>([], {
    transform: (p: MapPoly): MapCoords[] => {
      const result = polyToCoords(p);
      this.poly.set(result);
      return result;
    },
  });
  readonly editMode = input<boolean>(false);

  protected async updateCoords(event: MapMouseEvent | IconMouseEvent | PolyMouseEvent) {
    if (!event.latLng || this.editMode()) return;
    const result = await this.service.geocodeLatLng(event.latLng);
    this.mapChange.emit(result);
  }
}
