import { Component, ViewChild } from '@angular/core';
import {TipoRetencion} from 'domain/tipoRetencion';
import {ModalTipoRetencionComponent} from './modal-tipo-retencion/modal-tipo-retencion.component';
import {AbmComponent} from '../abm/abm.component';

@Component({
  selector: 'app-tipo-retencion',
  templateUrl: './tipo-retencion.component.html',
  styleUrls: ['./tipo-retencion.component.css']
})
export class TipoRetencionComponent {
  tipoRetencion = TipoRetencion;
  modal = ModalTipoRetencionComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
