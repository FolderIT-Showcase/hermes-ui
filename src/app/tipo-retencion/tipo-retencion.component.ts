import {
  ChangeDetectorRef, Component, OnInit, ViewChild, HostListener, OnDestroy,
  AfterViewChecked
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {TipoRetencion} from 'domain/tipoRetencion';
import {isNullOrUndefined} from 'util';
import { NumberValidatorsService } from '../../service/number-validator.service';

@Component({
  selector: 'app-tipo-retencion',
  templateUrl: './tipo-retencion.component.html',
  styleUrls: ['./tipo-retencion.component.css']
})
export class TipoRetencionComponent implements OnInit, AfterViewChecked, OnDestroy {
  mostrarTabla = false;
  submitted = false;
  enNuevo: boolean;
  modalTitle: string;
  tiporetenciones: TipoRetencion[] = [];
  tipoRetencionSeleccionado: TipoRetencion = new TipoRetencion;
  tipoRetencionOriginal: TipoRetencion;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  constructor(private apiService: ApiService, private cdRef: ChangeDetectorRef, private alertService: AlertService) {  }

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
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
          text: 'Nuevo Tipo de Retención',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
        /*, {
         text: 'Listado',
         key: '2',
         className: 'btn btn-default',
         action: () => {
         // TODO setear boton
         }
         }
         */
      ]
    };

    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('tiporetenciones')
      .subscribe(json => {
        this.tiporetenciones = json;
        this.dtTrigger.next();
      });
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Tipo de retención';
    this.enNuevo = true;
    this.tipoRetencionSeleccionado = new TipoRetencion();
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEliminar(tiporetencion: TipoRetencion) {
    this.tipoRetencionSeleccionado = tiporetencion;
  }

  mostrarModalEditar(tiporetencion: TipoRetencion) {
    this.modalTitle = 'Editar Tipo de retención';
    this.enNuevo = false;
    this.tipoRetencionOriginal = tiporetencion;
    this.tipoRetencionSeleccionado = JSON.parse(JSON.stringify(tiporetencion));
  }

  cerrar(f) {
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 200);
    }
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('tiporetenciones/' + this.tipoRetencionSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.tiporetenciones.indexOf(this.tipoRetencionSeleccionado);
        if (index !== -1) {
          this.tiporetenciones.splice(index, 1);
        }
        this.recargarTabla();
        this.cerrar(null);
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      const tipoRetencionAEnviar = new TipoRetencion();
      Object.assign(tipoRetencionAEnviar, this.tipoRetencionSeleccionado);
      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('tiporetenciones', tipoRetencionAEnviar).subscribe(
          json => {
            this.tiporetenciones.push(json);
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('tiporetenciones/' + tipoRetencionAEnviar.id, tipoRetencionAEnviar).subscribe(
          json => {
            Object.assign(this.tipoRetencionOriginal, json);
            this.recargarTabla();
          }
        );
      }
    }
  }

  private recargarTabla() {
    this.mostrarTabla = false;
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
    (<any>$('#modalReporte')).modal('hide');
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
