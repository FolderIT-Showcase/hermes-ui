import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {CuentaBancaria} from '../../../domain/cuentaBancaria';

@Component({
  selector: 'app-modal-cuenta-bancaria',
  templateUrl: './modal-cuenta-bancaria.component.html',
  styleUrls: ['./modal-cuenta-bancaria.component.css']
})
export class ModalCuentaBancariaComponent extends ModalAbmComponent<CuentaBancaria> {
  element = new CuentaBancaria();
  elementClass = CuentaBancaria;
}
