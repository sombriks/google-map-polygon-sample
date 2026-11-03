import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import GeocoderResult = google.maps.GeocoderResult;
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppGeocoderComponent } from './app-mapa/app-geocoder.component';
import { coordsToPoly, MapPoly } from './app-mapa/app-mapa.model';
import { AppPolyConfigComponent } from './app-mapa/app-poly-config.component';

@Component({
  imports: [AppMapaComponent, AppGeocoderComponent, AppPolyConfigComponent, MatButton],
  selector: 'app-root',
  styles: `
    .mapa
      display: grid
      grid-template-columns: 2fr 1fr
      //grid-template-rows: 1fr
      min-height: 100%
  `,
  template: `
    <div class="mapa">
      <app-mapa
        (polygonChanged)="polygon.set(coordsToPoly($event))"
        (verticeSelected)="currentVertice.set($event)"
        (coordsChanged)="updateCoords($event)"
        [editMode]="editDone()"
        [polygon]="polygon()"
        [coords]="coords()"
        mapId="m1"
      />
      <div>
        <app-geocoder [address]="address()" (addrChanged)="updateCoords($event)" />
        @if (editDone()) {
          <app-poly-config
            (polygonChanged)="polygon.set(coordsToPoly($event))"
            [currentVertice]="currentVertice()"
            (editDone)="editDone.set(false)"
            [polygon]="polygon()"
            [coords]="coords()"
          />
        } @else {
          <button matButton="outlined" (click)="editDone.set(true)">Edit</button>
        }
      </div>
    </div>
  `,
})
export class AppRootComponent {
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly address = signal('');
  protected readonly polygon = signal<MapPoly>({
    lat: [],
    lng: [],
  });
  protected readonly editDone = signal(false);
  protected currentVertice = signal(0);

  protected updateCoords(result: GeocoderResult) {
    if (!result) {
      this.address.set('');
      return;
    }
    this.coords.set(result.geometry.location.toJSON());
    this.address.set(result.formatted_address);
  }

  protected readonly coordsToPoly = coordsToPoly;
}
