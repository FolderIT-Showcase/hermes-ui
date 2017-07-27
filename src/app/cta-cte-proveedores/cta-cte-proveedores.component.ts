import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Proveedor} from '../../domain/proveedor';
import {CtaCteProveedor} from '../../domain/ctaCteProveedor';
import {ApiService} from '../../service/api.service';
import {Observable} from 'rxjs/Observable';
import {ComprobanteCompra} from '../../domain/comprobanteCompra';
import {TipoComprobanteCompra} from '../../domain/tipoComprobanteCompra';
import {AlertService} from '../../service/alert.service';
import {IMyDpOptions} from 'mydatepicker';
import {isNullOrUndefined} from 'util';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {ComprobanteCompraImportes} from '../../domain/comprobanteCompraImportes';
import {ComprobanteCompraRetencion} from '../../domain/comprobanteCompraRetencion';
import {TipoRetencion} from '../../domain/tipoRetencion';

@Component({
  selector: 'app-cta-cte-proveedores',
  templateUrl: './cta-cte-proveedores.component.html',
  styleUrls: ['./cta-cte-proveedores.component.css']
})
export class CtaCteProveedoresComponent implements OnInit, AfterViewInit, OnDestroy {

  proveedorCtaCteSeleccionado: Proveedor;
  fechaInicioCtaCte: any;
  fechaFinCtaCte: any;
  fechaSeleccionadaCtaCte: false;
  submitted = false;
  proveedorCtaCteAsync: string;
  registrosCtaCte: CtaCteProveedor[];
  proveedoresCtaCte: Proveedor[];
  listaProveedores: Proveedor[];
  comprobante: ComprobanteCompra = new ComprobanteCompra;
  ctaCteProveedorSeleccionada: CtaCteProveedor;
  iva = 0.21;
  saldo = 0.00;
  verComprPeriodo = '';
  verComprPuntoVenta = '';
  verComprNumero = '';
  verComprProveedorTipoResp = '';
  verComprTipo = '';
  verCompCCI: ComprobanteCompraImportes = new ComprobanteCompraImportes;
  verCompRetenciones: ComprobanteCompraRetencion[];
  verCompTipoRetencion: TipoRetencion[];
  tipos_responsable = [];
  dtOptions: any;
  regexTipoA: RegExp = new RegExp('..A');
  typeaheadNoResults: boolean;
  myDatePickerOptions: IMyDpOptions;
  @ViewChild('typeaheadNombreProveedor')
  private typeaheadNombreProveedorElement: ElementRef;

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {
    this.comprobante = new ComprobanteCompra;
    this.comprobante.tipo_comp_compras = new TipoComprobanteCompra;
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
    this.navbarTitleService.setTitle('Cuentas Corrientes de Proveedores');
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

    this.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'M', nombre: 'Monotributista'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'}
    ];

    this.proveedorCtaCteSeleccionado = new Proveedor;
    this.fechaSeleccionadaCtaCte = false;
    this.proveedorCtaCteAsync = '';
    this.registrosCtaCte = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth(), pastYear.getDate());
    this.fechaInicioCtaCte = { date: { year: pastYear.getFullYear(), month: pastYear.getMonth() + 1, day: pastYear.getDate() }};
    const today = new Date();
    this.fechaFinCtaCte =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }};
    this.proveedoresCtaCte = Observable.create((observer: any) => {
      this.apiService.get('proveedores/nombre/' + this.proveedorCtaCteAsync).subscribe(json => {
        this.listaProveedores = json;
        observer.next(json);
      });
    });

    this.apiService.get('tiporetenciones')
      .subscribe(resp => {
        this.verCompTipoRetencion = resp;
      });
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreProveedorElement.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.ocultarModals();
  }

  onProveedorCtaCteChanged(event) {
    this.proveedorCtaCteSeleccionado = event;
    this.proveedorCtaCteAsync = this.proveedorCtaCteSeleccionado.nombre;
  }

  changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  typeaheadOnBlur() {
    if (!isNullOrUndefined(this.proveedorCtaCteAsync)
      && this.proveedorCtaCteAsync.length > 0
      && this.proveedorCtaCteAsync !== this.proveedorCtaCteSeleccionado.nombre
      && !this.typeaheadNoResults) {
      this.proveedorCtaCteSeleccionado = this.listaProveedores[0];
      this.proveedorCtaCteAsync = this.proveedorCtaCteSeleccionado.nombre;
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

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalVer')).modal('hide');
  }

  canDeactivate() {
    this.ocultarModals();
    return true;
  }

  cerrar() {
  }

  filtrarCtaCte() {
    this.submitted = true;

    if ((this.proveedorCtaCteAsync.length > 0 && !(this.rangoFechaInvalido() && this.fechaSeleccionadaCtaCte))
      && !this.typeaheadNoResults && this.proveedorCtaCteAsync.length > 2) {
      if (this.proveedorCtaCteAsync !== this.proveedorCtaCteSeleccionado.nombre) {
        this.proveedorCtaCteSeleccionado = this.listaProveedores[0];
        this.proveedorCtaCteAsync = this.proveedorCtaCteSeleccionado.nombre;
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

      this.apiService.get('proveedores/cuentacorriente', {
        'proveedor_id': this.proveedorCtaCteSeleccionado.id,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }).subscribe( json => {
        this.registrosCtaCte = json;
        this.saldo = 0.0;
        this.registrosCtaCte.forEach( reg => {
          this.saldo += +reg.debe;
          this.saldo -= +reg.haber;
          reg.saldo = this.saldo.toFixed(2);
        });
        setTimeout(() => {$('#table').DataTable().columns.adjust(); }, 100);
      });
    }
  }

  mostrarModalVer(ctaCteProveedor: CtaCteProveedor) {
    this.ctaCteProveedorSeleccionada = ctaCteProveedor;
    this.apiService.get('comprobantescompra/' + ctaCteProveedor.comprobante_compras_id).subscribe( json => {
      this.comprobante = json;
      this.verComprProveedorTipoResp = this.tipos_responsable.find(x => x.clave === this.comprobante.proveedor_tipo_resp).nombre;
      this.verComprTipo = this.comprobante.tipo_comp_compras.nombre;
      this.verComprPuntoVenta = ('0000' + this.comprobante.punto_venta).slice(-4);
      this.verComprNumero = ('00000000' + this.comprobante.numero).slice(-8);
      this.verComprPeriodo = ('0' + this.comprobante.periodo.mes).slice(-2) + '/' + this.comprobante.periodo.anio;
      this.verCompCCI = this.comprobante.comprobante_compra_importes;
      this.verCompRetenciones = this.comprobante.comprobante_compra_retenciones;
      this.verCompRetenciones.forEach(x => {
        x.tipoRetencion = this.verCompTipoRetencion.find(t => t.id === x.retencion_id);
      });
      (<any>$('#modalVer')).modal('show');
    });
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

    this.apiService.downloadPDF('proveedores/cuentacorriente/reporte', {
        'proveedor_id': this.proveedorCtaCteSeleccionado.id,
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
}
