import { Component, signal } from '@angular/core';
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppGeocoderComponent } from './app-geocoder/app-geocoder.component';
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
      <app-mapa mapId="m1" [coords]="coords()" [polygon]="polygon()" (mapChange)="updateCoords($event)" />
      <app-geocoder [address]="address()" (addrChange)="updateCoords($event)" />
    </div>
  `,
})
export class AppComponent {
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly address = signal('');
  protected readonly polygon = signal([
    { lat: -3, lng: -38 },
    { lat: -3, lng: -39 },
    { lat: -4, lng: -39 },
    { lat: -4, lng: -38 },
    { lat: -5, lng: -37 },
  ]);

  protected updateCoords(result: GeocoderResult) {
    if (!result) {
      this.address.set('');
      return;
    }
    this.coords.set(result.geometry.location.toJSON());
    this.address.set(result.formatted_address);
  }
}
