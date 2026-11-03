import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import GeocoderResult = google.maps.GeocoderResult;
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppGeocoderComponent } from './app-geocoder/app-geocoder.component';
import { coordsToPoly, MapPoly } from './app-mapa/app-mapa.model';
import { AppPolyConfigComponent } from './app-poly-config/app-poly-config.component';

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
        mapId="m1"
        [coords]="coords()"
        [polygon]="polygon()"
        [editMode]="editDone()"
        (mapChange)="updateCoords($event)"
      />
      <div>
        <app-geocoder [address]="address()" (addrChange)="updateCoords($event)" />
        @if (editDone()) {
          <app-poly-editor
            [coords]="coords()"
            [polygon]="polygon()"
            (polygonChanged)="polygon.set(coordsToPoly($event))"
            (editDone)="editDone.set(false)"
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
