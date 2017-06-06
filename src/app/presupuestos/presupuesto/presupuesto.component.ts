import {Component, OnInit} from '@angular/core';
import {Comprobante} from '../../../domain/comprobante';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../service/api.service';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent implements OnInit {
  presupuesto: Comprobante;
  mostrarComponenteFactura = false;
  nuevoOEditar: string;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

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
  }

}