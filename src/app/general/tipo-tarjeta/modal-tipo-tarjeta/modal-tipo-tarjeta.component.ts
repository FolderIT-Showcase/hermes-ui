import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../../shared/components/abm/modal-abm/modal-abm.component';
import {TipoTarjeta} from '../../../shared/domain/tipoTarjeta';

@Component({
  selector: 'app-modal-tipo-tarjeta',
  templateUrl: '../../../shared/components/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-tipo-tarjeta.component.css']
})
export class ModalTipoTarjetaComponent extends ModalAbmComponent<TipoTarjeta> {
  element = new TipoTarjeta();
  elementClass = TipoTarjeta;
  formRows = [
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}],
    [{name: 'tipo', label: 'Tipo', labelsize: 2, fieldsize: 10}]
  ];
}
