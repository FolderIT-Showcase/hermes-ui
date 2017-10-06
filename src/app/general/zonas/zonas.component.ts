import {Component, ViewChild } from '@angular/core';
import { Zona } from '../../shared/domain/zona';
import {AbmComponent} from '../../shared/components/abm/abm.component';
import {ModalZonaComponent} from './modal-zona/modal-zona.component';

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
})
export class ZonasComponent {
  zona = Zona;
  modal = ModalZonaComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}