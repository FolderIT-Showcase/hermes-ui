import {Component, OnInit} from '@angular/core';
import {Comprobante} from '../../../shared/domain/comprobante';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../shared/services/api.service';
import {Subject} from 'rxjs/Subject';
import {NavbarTitleService} from '../../../shared/services/navbar-title.service';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent implements OnInit {
  presupuesto: Comprobante;
  mostrarComponenteFactura = false;
  nuevoOEditar: string;
  puedeSalir: Subject<Boolean> = new Subject;
  modificado = false;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private navbarTitleService: NavbarTitleService) { }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.presupuesto = new Comprobante;
    this.presupuesto.items = [];
    if (id !== 0) {
      this.nuevoOEditar = 'editar';
      this.apiService.get('comprobantes/' + id).subscribe( json => {
        this.presupuesto = json;
        this.presupuesto.items.forEach( item => {
          item.nombre = item.articulo.nombre;
          item.codigo = item.articulo.codigo;
          item.porcentaje_descuento = '0.00';
          item.importe_descuento = '0.00';
        });
        this.mostrarComponenteFactura = true;
      });
    } else {
      this.nuevoOEditar = 'nuevo';
      this.mostrarComponenteFactura = true;
    }
    this.navbarTitleService.setTitle('Presupuesto');
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
