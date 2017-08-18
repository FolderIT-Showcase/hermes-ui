import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Cheque} from '../../../../domain/cheque';
import {FastAbmComponent} from '../../../fast-abm/fast-abm.component';

@Component({
  selector: 'app-fast-abm-cheque',
  templateUrl: './fast-abm-cheque.component.html',
  styleUrls: ['./fast-abm-cheque.component.css']
})
export class FastAbmChequeComponent extends FastAbmComponent<Cheque> {
  nombreElemento = 'Cheque';
  elementClass = Cheque;
  element = new Cheque();

  format(element: Cheque) {
    element.banco_nombre = this.data.bancos.find(x => x.id === element.banco_id).nombre;
    element.cliente_id = this.data.cliente_id;
    element.estado = 'I';
    const today = new Date();
    element.fecha_ingreso =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    element.importe = (+element.importe).toFixed(2);
  }
}
