import {Component} from '@angular/core';
import {Cheque} from '../../shared/domain/cheque';
import {FastAbmComponent} from '../../shared/fast-abm/fast-abm.component';
import {isNullOrUndefined} from 'util';
import {HelperService} from '../../shared/services/helper.service';

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
    if (!isNullOrUndefined(element.fecha_vencimiento)) {
      element.fecha_vencimiento = HelperService.myDatePickerDateToString(element.fecha_vencimiento);
    }
    element.importe = (+element.importe).toFixed(2);
  }
}
