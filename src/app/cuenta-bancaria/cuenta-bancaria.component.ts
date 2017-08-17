import {Component, ViewChild} from '@angular/core';
import {CuentaBancaria} from '../../domain/cuentaBancaria';
import {ApiService} from '../../service/api.service';
import {ModalCuentaBancariaComponent} from './modal-cuenta-bancaria/modal-cuenta-bancaria.component';
import {AbmComponent} from '../abm/abm.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-cuenta-bancaria',
  templateUrl: './cuenta-bancaria.component.html',
  styleUrls: ['./cuenta-bancaria.component.css']
})
export class CuentaBancariaComponent {
  cuentaBancaria = CuentaBancaria;
  modal = ModalCuentaBancariaComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  constructor(private apiService: ApiService) {}

  cargarBancos(data) {
    return this.apiService.get('bancos').map(
      json => {
        data.bancos = json;
        return data;
      });
  }

  asignarNombreBancos(cuentasBancarias, data) {
    cuentasBancarias.forEach(element => {
      element.banco_nombre = data.bancos.find(x => x.id === element.banco_id).nombre;
    });
    return Observable.of(cuentasBancarias);
  }

  asignarNombreBanco(cuentasBancaria, data) {
    cuentasBancaria.banco_nombre = data.bancos.find(x => x.id === cuentasBancaria.banco_id).nombre;
    return Observable.of(cuentasBancaria);
  }

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
