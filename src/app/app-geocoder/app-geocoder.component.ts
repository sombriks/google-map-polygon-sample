import { Component, inject, input, output, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AppMapaService } from '../app-mapa/app-mapa.service';
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  selector: 'app-geocoder',
  styles: `
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
    <fieldset>
      <legend>Geocoding</legend>
      <div>
        <input
          (input)="field.set($any($event.target).value)"
          (keydown.enter)="query(field()?.trim())"
          [value]="field()"
        />
        <button matFab (click)="query(field()?.trim())">
          <mat-icon>search</mat-icon>
        </button>
        <div class="erro">{{ err() }}</div>
      </div>
    </fieldset>
  `,
  imports: [MatFabButton, MatIcon],
})
export class AppGeocoderComponent {
  protected readonly service = inject(AppMapaService);

  protected readonly field = signal('');
  protected readonly err = signal('');

  readonly addrChange = output<GeocoderResult>();

  readonly address = input.required<string, string>({
    transform: (value: string) => {
      this.field.set(value);
      return value;
    },
  });

  protected async query(address: string) {
    if (!address) {
      this.err.set('informe endereço ou parte do endereço');
      return;
    }
    this.err.set('');
    const result = await this.service.geocodeAddress(address);
    this.addrChange.emit(result);
  }
}
