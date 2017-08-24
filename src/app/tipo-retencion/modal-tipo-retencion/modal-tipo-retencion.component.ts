import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {TipoRetencion} from '../../../domain/tipoRetencion';

@Component({
  selector: 'app-modal-tipo-retencion',
  templateUrl: '../../abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-tipo-retencion.component.css']
})
export class ModalTipoRetencionComponent extends ModalAbmComponent<TipoRetencion> {
  element = new TipoRetencion();
  elementClass = TipoRetencion;
  formRows = [
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}],
    [{name: 'alicuota', label: 'Alicuota', labelsize: 2, fieldsize: 5, femenino: true, align: 'text-right', placeholder: '0,00'}],
  ];
}
