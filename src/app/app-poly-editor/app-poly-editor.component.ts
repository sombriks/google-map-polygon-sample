import { Component, inject, output, signal } from '@angular/core';
import { AppMapaService } from '../app-mapa/app-mapa.service';
import { MapCoords, MapPoly } from '../app-mapa/app-mapa.model';

@Component({
  selector: 'app-poly-editor',
  standalone: true,
  styles: `
    fieldset
      div
        display: flex
`,
  template: `
    <fieldset>
      <legend>Area Editor</legend>
      <div></div>
    </fieldset>
  `,
})
export class AppPolyEditorComponent {
  protected readonly service = inject(AppMapaService);
  protected readonly poly = signal<MapPoly>({
    lat: [],
    lng: [],
  });
  protected readonly currentVertice = signal<number>(0);

  readonly verticeSelected = output<number>();
}
