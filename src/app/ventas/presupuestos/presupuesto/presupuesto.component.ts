import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Comprobante} from '../../../shared/domain/comprobante';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../shared/services/api.service';
import {Subject} from 'rxjs/Subject';
import {TitleService} from '../../../shared/services/title.service';
import {Subscription} from 'rxjs/Subscription';
import {PuedeSalirComponent} from '../../../shared/components/puede-salir/puede-salir.component';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent implements OnInit, OnDestroy {
  presupuesto: Comprobante;
  mostrarComponenteFactura = false;
  nuevoOEditar: string;
  puedeSalir: Subject<Boolean> = new Subject;
  modificado = false;
  @ViewChild('puedeSalir')
  private puedeSalirElement: PuedeSalirComponent;
  private subscriptions: Subscription = new Subscription();

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private titleService: TitleService) { }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.presupuesto = new Comprobante;
    this.presupuesto.items = [];
    if (id !== 0) {
      this.nuevoOEditar = 'editar';
      this.subscriptions.add(this.apiService.get('comprobantes/' + id).subscribe( json => {
        this.presupuesto = json;
        this.presupuesto.items.forEach( item => {
          item.nombre = item.articulo.nombre;
          item.codigo = item.articulo.codigo;
          item.porcentaje_descuento = '0.00';
          item.importe_descuento = '0.00';
        });
        this.mostrarComponenteFactura = true;
      }));
    } else {
      this.nuevoOEditar = 'nuevo';
      this.mostrarComponenteFactura = true;
    }
    this.titleService.setTitle('Presupuesto');
  }

  canDeactivate() {
    return this.puedeSalirElement.check();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onModificadoChanged(nuevoEstado: boolean) {
    this.modificado = nuevoEstado;
    this.puedeSalirElement.modificado = this.modificado;
  }
}
