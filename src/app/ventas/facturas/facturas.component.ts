import {Component, OnInit} from '@angular/core';
import { Comprobante } from 'app/shared/domain/comprobante';
import {Subject} from 'rxjs/Subject';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  factura: Comprobante = new Comprobante;
  puedeSalir: Subject<Boolean> = new Subject;
  modificado = false;

  constructor(private navbarTitleService: NavbarTitleService) {}

  ngOnInit() {
    this.navbarTitleService.setTitle('Factura');
  }

  canDeactivate() {
    if (this.modificado) {
      (<any>$('#modalPuedeSalir')).modal('show');
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
