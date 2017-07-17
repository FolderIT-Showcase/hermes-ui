import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Cliente} from '../../domain/cliente';
import {CtaCteCliente} from '../../domain/ctaCteCliente';
import {ApiService} from '../../service/api.service';
import {Observable} from 'rxjs/Observable';
import {Comprobante} from '../../domain/comprobante';
import {TipoComprobante} from '../../domain/tipocomprobante';
import {AlertService} from '../../service/alert.service';
import {IMyDpOptions} from 'mydatepicker';
import {isNullOrUndefined} from 'util';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-cta-cte-clientes',
  templateUrl: './cta-cte-clientes.component.html',
  styleUrls: ['./cta-cte-clientes.component.css']
})
export class CtaCteClientesComponent implements OnInit, AfterViewInit, OnDestroy {
  clienteCtaCteSeleccionado: Cliente;
  fechaInicioCtaCte: any;
  fechaFinCtaCte: any;
  registrosCtaCte: CtaCteCliente[];
  fechaSeleccionadaCtaCte: false;
  clienteCtaCteAsync: string;
  clientesCtaCte: Cliente[];
  comprobante: Comprobante;
  iva = 0.21;
  saldo = 0.00;
  dtOptions: any;
  regexTipoA: RegExp = new RegExp('..A');
  submitted = false;
  typeaheadNoResults: boolean;
  listaClientes: Cliente[];
  myDatePickerOptions: IMyDpOptions;
  @ViewChild('typeaheadNombreCliente')
  private typeaheadNombreClienteElement: ElementRef;
  ctaCteClienteSeleccionada: CtaCteCliente;

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {
    this.comprobante = new Comprobante;
    this.comprobante.tipo_comprobante = new TipoComprobante;
  }

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
      dom: 'tp',
      scrollY: '60vh',
      paging: false,
      columnDefs: [ {
        'targets': 0,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 1,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 2,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 3,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 4,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 6,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      } ]
    };
    this.navbarTitleService.setTitle('Cuentas Corrientes de Clientes');
    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
      dayLabels: {su: 'Dom', mo: 'Lun', tu: 'Mar', we: 'Mié', th: 'Jue', fr: 'Vie', sa: 'Sáb'},
      monthLabels: {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
                    7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'},
      todayBtnTxt: 'Hoy',
      showClearDateBtn: false,
      editableDateField: false,
      openSelectorOnInputClick: true,
    };

    this.clienteCtaCteSeleccionado = new Cliente;
    this.fechaSeleccionadaCtaCte = false;
    this.clienteCtaCteAsync = '';
    this.registrosCtaCte = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth(), pastYear.getDate());
    this.fechaInicioCtaCte = { date: { year: pastYear.getFullYear(), month: pastYear.getMonth() + 1, day: pastYear.getDate() }};
    const today = new Date();
    this.fechaFinCtaCte =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }};
    this.clientesCtaCte = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteCtaCteAsync).subscribe(json => {
        this.listaClientes = json;
        observer.next(json);
      });
    });
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreClienteElement.nativeElement.focus();
  }

  filtrarCtaCte() {
    this.submitted = true;

    if ((this.clienteCtaCteAsync.length > 0 && !(this.rangoFechaInvalido() && this.fechaSeleccionadaCtaCte))
      && !this.typeaheadNoResults && this.clienteCtaCteAsync.length > 2) {
      if (this.clienteCtaCteAsync !== this.clienteCtaCteSeleccionado.nombre) {
        this.clienteCtaCteSeleccionado = this.listaClientes[0];
        this.clienteCtaCteAsync = this.clienteCtaCteSeleccionado.nombre;
      }
      let fechaInicioAEnviar = this.fechaInicioCtaCte.date.year + '-'
        + this.fechaInicioCtaCte.date.month
        + '-' + this.fechaInicioCtaCte.date.day;
      const fechaFinAEnviar = this.fechaFinCtaCte.date.year + '-' + this.fechaFinCtaCte.date.month + '-' + this.fechaFinCtaCte.date.day;
      if (!this.fechaSeleccionadaCtaCte) {
        const initialYear = new Date();
        initialYear.setTime(0);
        fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
      }

      this.apiService.get('cuentacorriente/buscar', {
        'cliente_id': this.clienteCtaCteSeleccionado.id,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }).subscribe( json => {
        this.registrosCtaCte = json;
        this.saldo = 0.0;
        this.registrosCtaCte.forEach( reg => {
          reg.ptoventaynumero = ('000' + reg.comprobante.punto_venta).slice(-4) + '-' + ('0000000' + reg.comprobante.numero).slice(-8);
          this.saldo += +reg.debe;
          this.saldo -= +reg.haber;
          reg.saldo = this.saldo.toFixed(2);
        });
        setTimeout(() => {$('#table').DataTable().columns.adjust(); }, 100);
      });
    }
  }

  onClienteCtaCteChanged(event) {
    this.clienteCtaCteSeleccionado = event;
    this.clienteCtaCteAsync = this.clienteCtaCteSeleccionado.nombre;
  }

  imprimirReporteCtaCte() {
    let fechaInicioAEnviar = this.fechaInicioCtaCte.date.year + '-' +
      this.fechaInicioCtaCte.date.month + '-' +
      this.fechaInicioCtaCte.date.day;
    const fechaFinAEnviar = this.fechaFinCtaCte.date.year + '-' + this.fechaFinCtaCte.date.month + '-' + this.fechaFinCtaCte.date.day;
    if (!this.fechaSeleccionadaCtaCte) {
      const initialYear = new Date();
      initialYear.setTime(0);
      fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
    }

    this.apiService.downloadPDF('cuentacorriente/reporte', {
      'cliente_id': this.clienteCtaCteSeleccionado.id,
      'fecha_inicio': fechaInicioAEnviar,
      'fecha_fin': fechaFinAEnviar,
      }
    ).subscribe(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        try {
          const win = window.open(fileURL, '_blank');
          win.print();
        } catch (e) {
          this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
        }
      }
    );
  }

  mostrarModalVer(ctaCteCliente: CtaCteCliente) {
    this.ctaCteClienteSeleccionada = ctaCteCliente;
    this.apiService.get('comprobantes/' + ctaCteCliente.comprobante_id).subscribe( json => {
      this.comprobante = json;
      this.comprobante.numero = ('000000' + this.comprobante.numero).slice(-8);
      this.comprobante.punto_venta = ('000' + this.comprobante.punto_venta).slice(-4);
      this.comprobante.items.forEach( item => {
        item.nombre = item.articulo.nombre;
        item.codigo = item.articulo.codigo;
        item.porcentaje_descuento = '0.00';
        item.importe_descuento = '0.00';
      });
      (<any>$('#modalVer')).modal('show');
    });
  }

  cerrar() {
  }

  changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  typeaheadOnBlur() {
    if (!isNullOrUndefined(this.clienteCtaCteAsync)
      && this.clienteCtaCteAsync.length > 0
      && this.clienteCtaCteAsync !== this.clienteCtaCteSeleccionado.nombre
      && !this.typeaheadNoResults) {
      this.clienteCtaCteSeleccionado = this.listaClientes[0];
      this.clienteCtaCteAsync = this.clienteCtaCteSeleccionado.nombre;
    }
  }

  rangoFechaInvalido(): boolean {
    return (this.fechaInicioCtaCte.date.year > this.fechaFinCtaCte.date.year)
      ||  ((this.fechaInicioCtaCte.date.year === this.fechaFinCtaCte.date.year) &&
      (this.fechaInicioCtaCte.date.month > this.fechaFinCtaCte.date.month))
      || ((this.fechaInicioCtaCte.date.year === this.fechaFinCtaCte.date.year) &&
      (this.fechaInicioCtaCte.date.month === this.fechaFinCtaCte.date.month)
      && this.fechaInicioCtaCte.date.day > this.fechaFinCtaCte.date.day);
  }

  imprimirPDF(ctaCteCliente: CtaCteCliente) {
    this.apiService.downloadPDF('comprobantes/imprimir/' + ctaCteCliente.comprobante_id, {}).subscribe(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        try {
          const win = window.open(fileURL, '_blank');
          win.print();
        } catch (e) {
          this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
        }
      }
    );
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalVer')).modal('hide');
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
