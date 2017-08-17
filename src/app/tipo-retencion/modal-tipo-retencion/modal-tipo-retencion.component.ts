import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {TipoRetencion} from '../../../domain/tipoRetencion';

@Component({
  selector: 'app-modal-tipo-retencion',
  templateUrl: './modal-tipo-retencion.component.html',
  styleUrls: ['./modal-tipo-retencion.component.css']
})
export class ModalTipoRetencionComponent extends ModalAbmComponent<TipoRetencion> {
  element = new TipoRetencion();
  elementClass = TipoRetencion;
}
