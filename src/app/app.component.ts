import { Component, inject, output, signal } from '@angular/core';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AppsService } from './app.service';
// os types não dependem do carregamento dinâmico da biblioteca lá no service
import GeocoderResult = google.maps.GeocoderResult;
import IconMouseEvent = google.maps.IconMouseEvent;
import MapMouseEvent = google.maps.MapMouseEvent;

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
      @if (svc.mapsApi.isLoading()) {
        <p>Carregando Google Maps...</p>
      } @else if (svc.mapsApi.error()) {
        <p>Erro ao carregar mapa: {{ svc.mapsApi.error() }}</p>
      } @else if (svc.mapsApi.hasValue()) {
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
      <fieldset>
        <legend>Geocoding</legend>
        <div>
          <input
            (input)="address.set($any($event.target).value)"
            (keydown.enter)="query(address()?.trim())"
            [value]="address()"
          />
          <button matFab (click)="query(address()?.trim())">
            <mat-icon>search</mat-icon>
          </button>
          <div class="erro">{{ err() }}</div>
        </div>
      </fieldset>
    </div>
  `,
})
export class AppComponent {
  protected readonly svc = inject(AppsService);
  // particulares deste mapa
  protected readonly center = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly zoom = signal(13);
  protected readonly mapId = signal('m');
  protected readonly err = signal('');
  // os que podem ser inputs
  protected readonly address = signal('');
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  // emitter
  readonly addrChange = output<GeocoderResult>();

  protected async updateCoords(event?: MapMouseEvent | IconMouseEvent) {
    if (!event) {
      this.address.set('');
      return;
    }
    try {
      const result = await this.svc.geocodeLatLng(event.latLng);
      this.address.set(result.formatted_address);
      this.coords.set(result.geometry.location.toJSON());
      this.addrChange.emit(result);
    } catch (e) {
      console.error(e);
      this.err.set(e as unknown as string);
    }
  }

  protected async query(address: string) {
    if(!address) {
      this.err.set('informe endereço ou parte do endereço');
      return;
    }
    this.err.set('');
    try {
      const result = await this.svc.geocodeAddress(address);
      this.address.set(result.formatted_address);
      this.coords.set(result.geometry.location.toJSON());
      this.center.set(result.geometry.location.toJSON());
      this.addrChange.emit(result);
    } catch (e) {
      console.error(e);
      this.err.set(e as unknown as string);
    }
  }
}
