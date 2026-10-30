import { Component, inject, output, signal } from '@angular/core';
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppMapaService } from './app-mapa/app-mapa.service';
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
      <app-mapa mapId="m1" [coords]="coords()" (mapChange)="updateCoords($event)" />
      <app-geocoder [address]="address()" (addrChange)="updateCoords($event)" />
    </div>
  `,
})
export class AppComponent {
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly address = signal('');

  protected updateCoords(result: GeocoderResult) {
    if (!result) {
      this.address.set('');
      return;
    }
    this.coords.set(result.geometry.location.toJSON());
    this.address.set(result.formatted_address);
  }
}
