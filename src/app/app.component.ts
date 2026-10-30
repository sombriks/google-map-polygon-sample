import { Component, inject, output, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AppMapaComponent } from './app-mapa/app-mapa.component';
import { AppMapaService } from './app-mapa/app-mapa.service';
// os types não dependem do carregamento dinâmico da biblioteca lá no service
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  imports: [MatIcon, MatFabButton, AppMapaComponent],
  selector: 'app-root',
  styles: `
    .mapa
      display: grid
      grid-template-columns: 2fr 1fr
      //grid-template-rows: 1fr
      min-height: 100%

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
      <app-mapa mapId="m1" [coords]="coords()" (mapChange)="updateCoords($event)" />
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
  protected readonly service = inject(AppMapaService);
  // particulares deste mapa
  protected readonly center = signal({ lat: -3.742183326231264, lng: -38.536 });
  protected readonly err = signal('');
  // os que podem ser inputs
  protected readonly address = signal('');
  protected readonly coords = signal({ lat: -3.742183326231264, lng: -38.536 });
  // emitter
  readonly addrChange = output<GeocoderResult>();

  protected updateCoords(result: GeocoderResult) {
    if (!result) {
      this.address.set('');
      return;
    }
    try {
      this.address.set(result.formatted_address);
      this.coords.set(result.geometry.location.toJSON());
      this.addrChange.emit(result);
    } catch (e) {
      console.error(e);
      this.err.set(e as unknown as string);
    }
  }

  protected async query(address: string) {
    if (!address) {
      this.err.set('informe endereço ou parte do endereço');
      return;
    }
    this.err.set('');
    try {
      const result = await this.service.geocodeAddress(address);
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
