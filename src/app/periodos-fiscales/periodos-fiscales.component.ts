import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { PeriodoFiscal } from 'domain/periodoFiscal';
import {ApiService} from '../../service/api.service';
import {Subject} from 'rxjs/Subject';
import {isNullOrUndefined} from 'util';
import {AlertService} from '../../service/alert.service';
import {DataTableDirective} from 'angular-datatables';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-periodos-fiscales',
  templateUrl: './periodos-fiscales.component.html',
  styleUrls: ['./periodos-fiscales.component.css']
})
export class PeriodosFiscalesComponent implements OnInit, AfterViewChecked, OnDestroy {
  submitted = false;
  enNuevo: boolean;
  existe = false;
  mostrarTabla = false;
  periodosFiscales: PeriodoFiscal[] = [];
  modalTitle: string;
  mes_index_str: string;
  periodoFiscalSeleccionado: PeriodoFiscal = new PeriodoFiscal;
  periodoFiscalOriginal: PeriodoFiscal;
  meses = [];
  anios = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  mostrarBarraCarga = true;

  constructor(private apiService: ApiService,
              private cdRef: ChangeDetectorRef,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {}

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

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
          text: 'Nuevo Periodo Fiscal',
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
    this.navbarTitleService.setTitle('Gestión de Períodos Fiscales');
    this.meses = [
      {clave: 1, nombre: 'Enero'},
      {clave: 2, nombre: 'Febrero'},
      {clave: 3, nombre: 'Marzo'},
      {clave: 4, nombre: 'Abril'},
      {clave: 5, nombre: 'Mayo'},
      {clave: 6, nombre: 'Junio'},
      {clave: 7, nombre: 'Julio'},
      {clave: 8, nombre: 'Agosto'},
      {clave: 9, nombre: 'Septiembre'},
      {clave: 10, nombre: 'Octubre'},
      {clave: 11, nombre: 'Noviembre'},
      {clave: 12, nombre: 'Diciembre'}
    ];

    const anioActual = (new Date).getFullYear();
    this.anios = [
      anioActual - 1,
      anioActual,
      anioActual + 1,
      anioActual + 2,
      anioActual + 3,
    ];

    this.apiService.get('periodosfiscales')
      .subscribe(json => {
        this.periodosFiscales = json;
        this.completarStringsMeses();
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
      });
  }

  completarStringsMeses() {
    this.periodosFiscales.forEach(
      periodofiscal => {
        periodofiscal.mes_str = this.meses.find(m => m.clave === periodofiscal.mes).nombre;
      });
  }

  mostrarModalNuevo() {
    this.existe = false;
    this.modalTitle = 'Nuevo Periodo Fiscal';
    this.enNuevo = true;
    this.periodoFiscalSeleccionado = new PeriodoFiscal;
    this.periodoFiscalSeleccionado.abierto = true;
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEliminar(periodofiscal: PeriodoFiscal) {
    this.periodoFiscalSeleccionado = periodofiscal;
  }

  mostrarModalEditar(periodofiscal: PeriodoFiscal) {
    this.existe = false;
    this.modalTitle = 'Editar Periodo Fiscal';
    this.enNuevo = false;
    this.periodoFiscalOriginal = periodofiscal;
    this.periodoFiscalSeleccionado = JSON.parse(JSON.stringify(periodofiscal));
  }

  cerrar(f) {
    this.existe = false;
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 200);
    }
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('periodosfiscales/' + this.periodoFiscalSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.periodosFiscales.indexOf(this.periodoFiscalSeleccionado);
        if (index !== -1) {
          this.periodosFiscales.splice(index, 1);
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
      const periodoFiscalAEnviar = new PeriodoFiscal;
      Object.assign(periodoFiscalAEnviar, this.periodoFiscalSeleccionado);
      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('periodosfiscales', periodoFiscalAEnviar).subscribe(
          json => {
            this.periodosFiscales.push(json);
            this.completarStringsMeses();
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('periodosfiscales/' + periodoFiscalAEnviar.id, periodoFiscalAEnviar).subscribe(
          json => {
            Object.assign(this.periodoFiscalOriginal, json);
            this.completarStringsMeses();
            this.recargarTabla();
          }
        );
      }
    }
  }

  private recargarTabla() {
    // this.mostrarTabla = false;
    this.completarStringsMeses();
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

  checkExists(pf: PeriodoFiscal) {
    // TODO chequear si la performance de llamar a la API es buena o tiene mucha latencia
    this.apiService.get('periodosfiscales').subscribe(
      json => {
        console.log(json.toString());
        if (json === '') {
          this.existe = false;
        } else {
          const periodofisc = json.find(p => p.mes === pf.mes && p.anio === pf.anio);
          if (periodofisc === undefined) {
            this.existe = false;
          } else {
            if (periodofisc.id === pf.id) {
              this.existe = false;
            } else {
              this.existe = true;
            }
          }
        }
    });
  }
}
