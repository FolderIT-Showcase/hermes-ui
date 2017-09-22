import {Component, OnInit, ViewChild} from '@angular/core';
import { Comprobante } from '../../shared/domain/comprobante';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {PuedeSalirComponent} from '../../shared/components/puede-salir/puede-salir.component';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  factura: Comprobante = new Comprobante;
  @ViewChild('puedeSalir')
  private puedeSalirElement: PuedeSalirComponent;

  modificado = false;

  constructor(private navbarTitleService: NavbarTitleService) {}

  ngOnInit() {
    this.navbarTitleService.setTitle('Factura');
  }

  canDeactivate() {
    return this.puedeSalirElement.check();
  }
}
