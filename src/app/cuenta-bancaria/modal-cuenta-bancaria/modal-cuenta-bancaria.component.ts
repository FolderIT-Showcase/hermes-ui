import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {CuentaBancaria} from '../../../domain/cuentaBancaria';

@Component({
  selector: 'app-modal-cuenta-bancaria',
  templateUrl: '../../abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-cuenta-bancaria.component.css']
})
export class ModalCuentaBancariaComponent extends ModalAbmComponent<CuentaBancaria> {
  element = new CuentaBancaria();
  elementClass = CuentaBancaria;
  formRows = [
    [{name: 'banco_id', label: 'Banco', labelsize: 2, fieldsize: 10}],
    [{name: 'tipo', label: 'Tipo', labelsize: 2, fieldsize: 10}],
    [{name: 'numero', label: 'Número', labelsize: 2, fieldsize: 10}]
  ];
}
