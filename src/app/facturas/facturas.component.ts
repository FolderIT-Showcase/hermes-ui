import { Component } from '@angular/core';
import { Comprobante } from 'domain/comprobante';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent {
  factura: Comprobante = new Comprobante;
  puedeSalir: Subject<Boolean> = new Subject;
  modificado = false;

  canDeactivate() {
    if (this.modificado) {
      $('#modalPuedeSalir').modal('show');
      return this.puedeSalir;
    } else {
      return true;
    }
  }

  continuar() {
    this.puedeSalir.next(true);
  }

  cancelar() {
    this.puedeSalir.next(false);
  }
}
