import {Component, OnInit, ViewChild} from '@angular/core';
import {TipoTarjeta} from '../../domain/tipoTarjeta';
import {AbmComponent} from '../abm/abm.component';
import {ModalTipoTarjetaComponent} from './modal-tipo-tarjeta/modal-tipo-tarjeta.component';

@Component({
  selector: 'app-tipo-tarjeta',
  templateUrl: './tipo-tarjeta.component.html',
  styleUrls: ['./tipo-tarjeta.component.css']
})
export class TipoTarjetaComponent {
  tipoTarjeta = TipoTarjeta;
  modal = ModalTipoTarjetaComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
