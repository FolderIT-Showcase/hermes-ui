import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../../shared/services/api.service';
import {Comprobante} from '../../shared/domain/comprobante';
import {TipoComprobante} from '../../shared/domain/tipocomprobante';
import {IMyDpOptions} from 'mydatepicker';
import {TitleService} from '../../shared/services/title.service';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs/Subject';
import {HelperService} from '../../shared/services/helper.service';
import {Cliente} from '../../shared/domain/cliente';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {ImpresionService} from '../../shared/services/impresion.service';

@Component({
  selector: 'app-impresion',
  templateUrl: './impresion.component.html',
  styleUrls: ['./impresion.component.css']
})
export class ImpresionComponent implements OnInit, AfterViewInit, OnDestroy {
  tipoComprobanteSeleccionadoId: number;
  comprobantes: any[];
  fechaInicio: any;
  fechaFin: any;
  fechaSeleccionada: false;
  comprobante: Comprobante;
  dtOptions: any = {};
  submitted = false;
  myDatePickerOptions: IMyDpOptions;
  tipos_comprobantes: TipoComprobante[];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  mostrarTabla = false;
  clientes: Cliente[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private titleService: TitleService,
              private impresionService: ImpresionService) {}

  ngOnInit() {
    this.dtOptions = {
      language: {
        'processing':     'Procesando...',
        'lengthMenu':     'Mostrar _MENU_ registros',
        'zeroRecords':    '',
        'emptyTable':     '',
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
      dom: 'frtip',
      pagingType: 'full_numbers',
      pageLength: 10,
      scrollY: '57vh',
      columnDefs: [ {
        'targets': 0,
        'width': '15%'
      }, {
        'targets': 1,
        'width': '15%'
      }, {
        'targets': 2,
        'width': '20%'
      }, {
        'targets': 3,
        'width': '20%'
      }, {
        'targets': 4,
        'width': '20%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }]
    };
    this.titleService.setTitle('Impresión de Comprobantes');
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();

    this.fechaSeleccionada = false;
    this.comprobantes = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth(), pastYear.getDate());
    this.fechaInicio = { date: { year: pastYear.getFullYear(), month: pastYear.getMonth() + 1, day: pastYear.getDate() }};
    const today = new Date();
    this.fechaFin =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }};

    this.tipoComprobanteSeleccionadoId = 0;

    this.tipos_comprobantes = [];
    this.subscriptions.add(this.apiService.get('tipocomprobantes').subscribe( json => {
      this.tipos_comprobantes = json;
    }));
    this.subscriptions.add(this.apiService.get('clientes').subscribe( json => {
      this.clientes = json;
    }));
  }

  ngAfterViewInit(): void {
  }

  filtrar() {
    this.submitted = true;

    if (!(this.rangoFechaInvalido() && this.fechaSeleccionada)) {
      let fechaInicioAEnviar = this.fechaInicio.date.year + '-'
        + this.fechaInicio.date.month
        + '-' + this.fechaInicio.date.day;
      const fechaFinAEnviar = this.fechaFin.date.year + '-' + this.fechaFin.date.month + '-' + this.fechaFin.date.day;
      if (!this.fechaSeleccionada) {
        const initialYear = new Date();
        initialYear.setTime(0);
        fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
      }

      this.subscriptions.add(this.apiService.get('comprobantes/buscar', {
        'tipo_comprobante': this.tipoComprobanteSeleccionadoId,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }).subscribe( json => {
        this.comprobantes = json;
        this.comprobantes.forEach( comprobante => {
          comprobante.ptoventaynumero = ('000' + comprobante.punto_venta).slice(-4) + '-' + ('0000000' + comprobante.numero).slice(-8);
          if (isNullOrUndefined(comprobante.cliente_nombre)) {
            comprobante.cliente_nombre = this.clientes.find(cliente => cliente.id === comprobante.cliente_id).nombre;
          }
        });
        if (!this.mostrarTabla) {
          setTimeout(() => { this.mostrarTabla = true; this.dtTrigger.next(); }, 350);
        } else {
          this.recargarTabla();
        }
      }));
    }
  }

  cerrar() {
  }

  rangoFechaInvalido(): boolean {
    return HelperService.rangoFechaInvalido(this.fechaInicio, this.fechaFin);
  }

  imprimirPDF(comprobante: Comprobante) {
    let observable: Observable<any>;
    if (comprobante.tipo_comprobante.codigo !== 'REC') {
      observable = this.apiService.downloadPDF('comprobantes/imprimir/' + comprobante.id, {});
    } else {
      observable = this.apiService.downloadPDF('cobros/imprimir/' + comprobante.id, {});
    }
    this.subscriptions.add(observable.subscribe(
      (res) => {
        this.impresionService.imprimir(res);
      }
    ));
  }

  private recargarTabla() {
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
  ocultarModals() {}

  ngOnDestroy() {
    this.ocultarModals();
    this.subscriptions.unsubscribe();
  }

// noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
