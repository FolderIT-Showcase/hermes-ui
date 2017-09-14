import { Component} from '@angular/core';
import {FastAbmComponent} from '../../shared/fast-abm/fast-abm.component';
import {Deposito} from '../../shared/domain/deposito';

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
    element.cliente_id = this.data.cliente_id;
    element.cuenta_numero = this.data.cuentas.find(x => x.id === element.cuenta_id).numero;
    const today = new Date();
    element.fecha_ingreso =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    element.importe = (+element.importe).toFixed(2);
  }
}
