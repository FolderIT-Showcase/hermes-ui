import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {TipoTarjeta} from '../../../domain/tipoTarjeta';

@Component({
  selector: 'app-modal-tipo-tarjeta',
  templateUrl: './modal-tipo-tarjeta.component.html',
  styleUrls: ['./modal-tipo-tarjeta.component.css']
})
export class ModalTipoTarjetaComponent extends ModalAbmComponent<TipoTarjeta> {
  element = new TipoTarjeta();
  elementClass = TipoTarjeta;
}
