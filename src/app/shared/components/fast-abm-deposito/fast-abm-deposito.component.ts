import { Component} from '@angular/core';
import {FastAbmComponent} from '../fast-abm/fast-abm.component';
import {Deposito} from '../../domain/deposito';

@Component({
  selector: 'app-fast-abm-deposito',
  templateUrl: './fast-abm-deposito.component.html',
  styleUrls: ['./fast-abm-deposito.component.css']
})
export class FastAbmDepositoComponent extends FastAbmComponent<Deposito> {
  nombreElemento = 'Depósito';
  elementClass = Deposito;
  element = new Deposito();

  format(element: Deposito) {
    if (this.cobro) {
      element.cliente_id = this.data.cliente_id;
    } else {
      element.proveedor_id = this.data.proveedor_id;
    }

    element.cuenta_numero = this.data.cuentas.find(x => x.id === element.cuenta_id).numero;
    const today = new Date();
    element.fecha_ingreso =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    element.importe = (+element.importe).toFixed(2);
  }
}
