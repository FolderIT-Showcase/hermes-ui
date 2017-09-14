import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Tarjeta} from '../../../shared/domain/tarjeta';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../../shared/services/api.service';
import {AlertService} from '../../../shared/services/alert.service';
import {Cliente} from '../../../shared/domain/cliente';
import {TipoTarjeta} from '../../../shared/domain/tipoTarjeta';
import {Observable} from 'rxjs/Observable';
import {ModalTarjetaComponent} from './modal-tarjeta/modal-tarjeta.component';
import {HelperService} from '../../../shared/services/helper.service';

@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrls: ['./tarjetas.component.css']
})
export class TarjetasComponent implements OnInit, OnDestroy {
  @Input() filter: any;
  clientes: Cliente[] = [];
  tipos: TipoTarjeta[] = [];
  tarjetaOriginal: Tarjeta;
  dtOptions: any = {};
  tarjetas: Tarjeta[] = [];
  dtTrigger: Subject<any> = new Subject();
  tarjetaSeleccionada: Tarjeta = new Tarjeta();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild(ModalTarjetaComponent)
  modalTarjeta: ModalTarjetaComponent;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  constructor(private apiService: ApiService,
              private alertService: AlertService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 12,
      scrollY: '63.5vh',
      language: HelperService.defaultDataTablesLanguage(),
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false,
        'width': '5%'
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nueva Tarjeta',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };

    const observableTarjetas = this.apiService.get('tarjetas/buscar', this.filter);
    const observableClientes = this.apiService.get('clientes');
    const observableTipos = this.apiService.get('tipostarjeta');
    const zip = Observable.zip(observableTarjetas, observableClientes, observableTipos);
    zip.subscribe(data => {
        this.tarjetas = data[0];
        this.clientes = data[1];
        this.tipos = data[2];

        this.tarjetas.forEach(element => {
          element.tarjeta_nombre = this.tipos.find(x => x.id === element.tarjeta_id).nombre;
        });

        this.tarjetas.forEach(element => {
          if (!!element.cliente_id) {
            element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
          }
        });

        this.mostrarBarraCarga = false;
        this.mostrarTabla = true;
        this.dtTrigger.next();
      },
      () => {
        this.mostrarBarraCarga = false;
      });
  }

  mostrarModalEditar(tarjeta: Tarjeta) {
    this.tarjetaOriginal = tarjeta;
    this.modalTarjeta.editarTarjeta(tarjeta);
  }

  mostrarModalEliminar(tarjeta: Tarjeta) {
    this.tarjetaSeleccionada = tarjeta;
  }

  mostrarModalNuevo() {
    this.modalTarjeta.nuevaTarjeta();
  }

  eliminar() {
    this.apiService.delete('tarjetas/' + this.tarjetaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.tarjetas.indexOf(this.tarjetaSeleccionada);
        if (index !== -1) {
          this.tarjetas.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  handleNew(tarjeta: Tarjeta) {
    this.tarjetas.push(tarjeta);
    this.recargarTabla();
  }

  handleEdit(tarjeta: Tarjeta) {
    Object.assign(this.tarjetaOriginal, tarjeta);
  }

  private recargarTabla() {
//     this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  // noinspection JSMethodCanBeStatic
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    ModalTarjetaComponent.close();
    (<any>$('#modalEliminar')).modal('hide');
  }

  ngOnDestroy() {
    this.ocultarModals();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
