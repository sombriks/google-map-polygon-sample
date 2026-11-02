import { Component, signal } from '@angular/core';
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppGeocoderComponent } from './app-geocoder/app-geocoder.component';
import { MapPoly } from './app-mapa/app-mapa.model';
// os types não dependem do carregamento dinâmico da biblioteca lá no service
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  imports: [AppMapaComponent, AppGeocoderComponent],
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
        (mapChange)="updateCoords($event)"
      />
      <div>
        <app-geocoder [address]="address()" (addrChange)="updateCoords($event)" />
      </div>
    </div>
  `,
})
export class AppComponent {
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly address = signal('');
  protected readonly polygon = signal<MapPoly>({
    lat: [-3, -3, -4, -5, -4],
    lng: [-38, -39, -39, -38, -37],
  });

  protected updateCoords(result: GeocoderResult) {
    if (!result) {
      this.address.set('');
      return;
    }
    this.coords.set(result.geometry.location.toJSON());
    this.address.set(result.formatted_address);
  }
}
