import {Component, ViewChild} from '@angular/core';
import {AbmComponent} from '../../shared/components/abm/abm.component';
import {PuntoVenta} from '../../shared/domain/puntoVenta';
import {ModalPuntoVentaComponent} from './modal-punto-venta/modal-punto-venta.component';

@Component({
  selector: 'app-puntos-venta',
  templateUrl: './puntos-venta.component.html',
  styleUrls: ['./puntos-venta.component.css']
})
export class PuntosVentaComponent {
  puntoVenta = PuntoVenta;
  modal = ModalPuntoVentaComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
