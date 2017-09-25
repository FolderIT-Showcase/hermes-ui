import {Component} from '@angular/core';
import {FastAbmComponent} from '../../../shared/components/fast-abm/fast-abm.component';
import {ChequePropio} from '../../../shared/domain/chequePropio';
import {isNullOrUndefined} from 'util';
import {HelperService} from '../../../shared/services/helper.service';

@Component({
  selector: 'app-fast-abm-cheque-propio',
  templateUrl: './fast-abm-cheque-propio.component.html',
  styleUrls: ['./fast-abm-cheque-propio.component.css']
})
export class FastAbmChequePropioComponent extends FastAbmComponent<ChequePropio> {
  nombreElemento = 'Cheque';
  elementClass = ChequePropio;
  element = new ChequePropio();

  format(element: ChequePropio) {
    // element.banco_nombre = this.data.bancos.find(x => x.id === element.banco_id).nombre;
    // element.cliente_id = this.data.cliente_id;
    element.cuenta_numero = this.data.cuentas.find(x => x.id === element.cuenta_bancaria_id).numero;

    if (!isNullOrUndefined(element.fecha_vencimiento)) {
      element.fecha_vencimiento = HelperService.myDatePickerDateToString(element.fecha_vencimiento);
    }
    if (!isNullOrUndefined(element.fecha_emision)) {
      element.fecha_emision = HelperService.myDatePickerDateToString(element.fecha_emision);
    }
    element.importe = (+element.importe).toFixed(2);
  }

  editar(elementAEditar: ChequePropio) {
    this.elementOriginal = elementAEditar;
    this.enNuevo = false;
    this.element = JSON.parse(JSON.stringify(elementAEditar));
    if (!isNullOrUndefined(this.element.fecha_vencimiento)) {
      this.element.fecha_vencimiento = HelperService.stringToMyDatePickerDate(this.element.fecha_vencimiento);
    }
    if (!isNullOrUndefined(this.element.fecha_emision)) {
      this.element.fecha_emision = HelperService.stringToMyDatePickerDate(this.element.fecha_emision);
    }
  }

  nuevo() {
    this.enNuevo = true;
    this.element = new this.elementClass();
    const today = new Date();
    this.element.fecha_emision =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
  }
}
