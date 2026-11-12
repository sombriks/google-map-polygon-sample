import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { AppMapaService } from './app-mapa.service';
import { MapCoords, MapPoly, polyToCoords } from './app-mapa.model';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-poly-config',
  standalone: true,
  styles: `
    fieldset
      div
        display: flex
        gap: 10px
`,
  template: `
    <fieldset>
      <legend>Area Editor</legend>
      <div style="justify-content: space-between">
        <button matButton="outlined" [disabled]="!poly()?.lat?.length" (click)="removeVertice()">
          -
        </button>
        <mat-button-toggle-group [value]="current()">
          @for (l of poly()?.lat; track $index) {
            <mat-button-toggle [value]="$index">{{ $index }}</mat-button-toggle>
          } @empty {
            <i>Adicione vertices</i>
          }
        </mat-button-toggle-group>
        <button matButton="outlined" (click)="addVertice()">+</button>
      </div>
      <br />
      <div style="justify-content: end">
        <button matButton="outlined" (click)="editDone.emit(true)">Done</button>
      </div>
    </fieldset>
  `,
  imports: [MatButtonToggleGroup, MatButtonToggle, MatButton],
})
export class AppPolyConfigComponent {
  protected readonly service = inject(AppMapaService);

  readonly editDone = output<boolean>();
  readonly polygonChanged = output<MapCoords[]>();

  readonly coords = input<MapCoords>({ ...this.service.ORIGEM });
  readonly polygon = input<MapPoly>({
    lat: [],
    lng: [],
  });
  readonly currentVertice = input<number>(0);

  protected readonly poly = linkedSignal(() => this.polygon());
  protected readonly current = linkedSignal(() => this.currentVertice());

  protected removeVertice() {
    const indexToRemove = this.current();
    const currentPoly = this.poly();
    const newLatArray = [...currentPoly.lat];
    const newLngArray = [...currentPoly.lng];
    newLatArray.splice(indexToRemove, 1);
    newLngArray.splice(indexToRemove, 1);
    this.poly.set({
      lat: newLatArray,
      lng: newLngArray,
    });
    this.current.set(indexToRemove > 0 ? indexToRemove - 1 : 0);
    this.polygonChanged.emit(polyToCoords(this.poly()));
  }

  protected addVertice(): void {
    const baseCoords = this.coords();
    const currentPoly = this.poly();
    const count = currentPoly.lat.length;
    const GOLDEN_ANGLE = 2.39996;
    const angle = count * GOLDEN_ANGLE;
    const baseRadius = 0.0005;
    const radius = baseRadius + count * 0.0001;
    const offsetLat = radius * Math.sin(angle);
    const offsetLng = radius * Math.cos(angle);
    const newLat = baseCoords.lat + offsetLat;
    const newLng = baseCoords.lng + offsetLng;
    const indexToInsert = count > 0 ? this.current() + 1 : 0;
    const newLatArray = [...currentPoly.lat];
    const newLngArray = [...currentPoly.lng];
    newLatArray.splice(indexToInsert, 0, newLat);
    newLngArray.splice(indexToInsert, 0, newLng);
    this.poly.set({
      lat: newLatArray,
      lng: newLngArray,
    });
    this.polygonChanged.emit(polyToCoords(this.poly()));
  }
}
