import {Component, ViewChild } from '@angular/core';
import { Zona } from 'domain/zona';
import {AbmComponent} from '../abm/abm.component';

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
})
export class ZonasComponent {
  zona = Zona;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    this.abmComponent.ocultarModals();
    return true;
  }
}
