import {Component, OnInit, ViewChild} from '@angular/core';
import { Comprobante } from '../../shared/domain/comprobante';
import {TitleService} from '../../shared/services/title.service';
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

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.setTitle('Factura');
  }

  canDeactivate() {
    return this.puedeSalirElement.check();
  }

  onModificadoChanged(nuevoEstado: boolean) {
    this.modificado = nuevoEstado;
    this.puedeSalirElement.modificado = this.modificado;
  }
}
