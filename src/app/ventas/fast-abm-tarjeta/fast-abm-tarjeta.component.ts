import { Component} from '@angular/core';
import {FastAbmComponent} from '../../shared/fast-abm/fast-abm.component';
import {Tarjeta} from '../../shared/domain/tarjeta';

@Component({
  selector: 'app-fast-abm-tarjeta',
  templateUrl: './fast-abm-tarjeta.component.html',
  styleUrls: ['./fast-abm-tarjeta.component.css']
})
export class FastAbmTarjetaComponent extends FastAbmComponent<Tarjeta> {
  nombreElemento = 'Tarjeta';
  elementClass = Tarjeta;
  element = new Tarjeta();

  format(element: Tarjeta) {
    element.cliente_id = this.data.cliente_id;
    element.tarjeta_nombre = this.data.tipos.find(x => x.id === element.tarjeta_id).nombre;
    element.estado = 'I';
    const today = new Date();
    element.fecha_ingreso =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    element.importe = (+element.importe).toFixed(2);
  }
}
