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
          [gmpDraggable]="!editMode()"
          [position]="coords()"
        />
        @if (poly().length > 0) {
          <map-polygon (polygonClick)="updateCoords($event)" [paths]="poly()" />
          @if (editMode()) {
            @for (vertice of poly(); track $index) {
              <map-advanced-marker
                (mapDragend)="updateVertices($event, $index)"
                (gmpClick)="verticeSelected.emit($index)"
                [gmpDraggable]="true"
                [position]="vertice"
              />
            }
          }
        }
      </google-map>
    }
  `,
  imports: [GoogleMap, MapAdvancedMarker, MapPolygon],
})
export class AppMapaComponent {
  protected readonly service = inject(AppMapaService);

  readonly coordsChanged = output<GeocoderResult>();
  readonly polygonChanged = output<MapCoords[]>();
  readonly verticeSelected = output<number>();

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
    const oldCoord = this.coords();
    const newCoords = event.latLng.toJSON();
    const delta = { lat: newCoords.lat - oldCoord.lat, lng: newCoords.lng - oldCoord.lng };
    const updatedPoly = this.poly().map((v) => ({
      lat: v.lat + delta.lat,
      lng: v.lng + delta.lng,
    }));
    this.polygonChanged.emit(updatedPoly);
    this.coordsChanged.emit(result);
  }

  protected updateVertices(event: MapMouseEvent | IconMouseEvent | PolyMouseEvent, index: number) {
    if (!event.latLng) return;
    const updatedPoly = [...this.poly()];
    updatedPoly[index] = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.poly.set(updatedPoly);
    this.polygonChanged.emit(updatedPoly);
    this.verticeSelected.emit(index);
  }
}
