import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TipoTarjeta} from '../../domain/tipoTarjeta';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-tipo-tarjeta',
  templateUrl: './tipo-tarjeta.component.html',
  styleUrls: ['./tipo-tarjeta.component.css']
})
export class TipoTarjetaComponent implements OnInit, OnDestroy {

  enNuevo: boolean;
  tipoTarjetaOriginal: TipoTarjeta;
  dtOptions: any = {};
  tipoTarjetas: TipoTarjeta[] = [];
  dtTrigger: Subject<any> = new Subject();
  tipoTarjetaSeleccionada: TipoTarjeta = new TipoTarjeta();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 13,
      scrollY: '70vh',
      language: {
        'processing':     'Procesando...',
        'lengthMenu':     'Mostrar _MENU_ registros',
        'zeroRecords':    'No se encontraron resultados',
        'emptyTable':     'Ningún dato disponible en esta tabla',
        'info':           'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        'infoEmpty':      'Mostrando registros del 0 al 0 de un total de 0 registros',
        'infoFiltered':   '(filtrado de un total de _MAX_ registros)',
        'infoPostFix':    '',
        'search':         'Buscar:',
        'url':            '',
        // 'infoThousands':  ',',
        'loadingRecords': 'Cargando...',
        'paginate': {
          'first':    'Primero',
          'last':     'Último',
          'next':     'Siguiente',
          'previous': 'Anterior'
        },
        'aria': {
          'sortAscending':  ': Activar para ordenar la columna de manera ascendente',
          'sortDescending': ': Activar para ordenar la columna de manera descendente'
        }
      },
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nuevo Tipo de Tarjeta',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Tipos de Tarjeta');
    this.apiService.get('tipostarjeta')
      .subscribe(json => {
          this.tipoTarjetas = json;
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
  }

  mostrarModalEditar(tipoTarjeta: TipoTarjeta) {
    this.modalTitle = 'Editar Tipo de Tarjeta';
    this.enNuevo = false;
    this.tipoTarjetaOriginal = tipoTarjeta;
    this.tipoTarjetaSeleccionada = JSON.parse(JSON.stringify(tipoTarjeta));
  }

  mostrarModalEliminar(tipoTarjeta: TipoTarjeta) {
    this.tipoTarjetaSeleccionada = tipoTarjeta;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const tipoTarjetaAEnviar = new TipoTarjeta();
      Object.assign(tipoTarjetaAEnviar, this.tipoTarjetaSeleccionada);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('tipostarjeta', tipoTarjetaAEnviar).subscribe(
          json => {
            this.tipoTarjetas.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('tipostarjeta/' + tipoTarjetaAEnviar.id, tipoTarjetaAEnviar).subscribe(
          json => {
            Object.assign(this.tipoTarjetaOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Tipo de Tarjeta';
    this.enNuevo = true;
    this.tipoTarjetaSeleccionada = new TipoTarjeta;
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('tipostarjeta/' + this.tipoTarjetaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.tipoTarjetas.indexOf(this.tipoTarjetaSeleccionada);
        if (index !== -1) {
          this.tipoTarjetas.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
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
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
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
