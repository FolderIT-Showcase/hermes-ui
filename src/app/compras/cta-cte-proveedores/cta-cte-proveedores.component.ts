import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Proveedor} from '../../shared/domain/proveedor';
import {CtaCteProveedor} from '../../shared/domain/ctaCteProveedor';
import {ApiService} from '../../shared/services/api.service';
import {Observable} from 'rxjs/Observable';
import {ComprobanteCompra} from '../../shared/domain/comprobanteCompra';
import {TipoComprobanteCompra} from '../../shared/domain/tipoComprobanteCompra';
import {IMyDpOptions} from 'mydatepicker';
import {isNullOrUndefined} from 'util';
import {TitleService} from '../../shared/services/title.service';
import {ComprobanteCompraImportes} from '../../shared/domain/comprobanteCompraImportes';
import {ComprobanteCompraRetencion} from '../../shared/domain/comprobanteCompraRetencion';
import {TipoRetencion} from '../../shared/domain/tipoRetencion';
import {HelperService} from '../../shared/services/helper.service';
import {Subscription} from 'rxjs/Subscription';
import {OrdenPago} from '../../shared/domain/ordenPago';
import {ItemOrdenPago} from '../../shared/domain/itemOrdenPago';
import {ImpresionService} from '../../shared/services/impresion.service';

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
  comprobante: ComprobanteCompra | OrdenPago;
  ctaCteProveedorSeleccionada: CtaCteProveedor = new CtaCteProveedor();
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
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private titleService: TitleService,
              private impresionService: ImpresionService) {
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
    this.titleService.setTitle('Cuentas Corrientes de Proveedores');
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();

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
      this.subscriptions.add(this.apiService.get('proveedores/nombre/' + this.proveedorCtaCteAsync).subscribe(json => {
        this.listaProveedores = json;
        observer.next(json);
      }));
    });

    this.subscriptions.add(this.apiService.get('tiporetenciones')
      .subscribe(resp => {
        this.verCompTipoRetencion = resp;
      }));
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreProveedorElement.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.ocultarModals();
    this.subscriptions.unsubscribe();
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
    return HelperService.rangoFechaInvalido(this.fechaInicioCtaCte, this.fechaFinCtaCte);
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
      let fechaInicioAEnviar = HelperService.myDatePickerDateToString(this.fechaInicioCtaCte);
      const fechaFinAEnviar = HelperService.myDatePickerDateToString(this.fechaFinCtaCte);
      if (!this.fechaSeleccionadaCtaCte) {
        const initialYear = new Date();
        initialYear.setTime(0);
        fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
      }

      this.subscriptions.add( this.apiService.get('proveedores/cuentacorriente', {
        'proveedor_id': this.proveedorCtaCteSeleccionado.id,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }).subscribe( json => {
        this.registrosCtaCte = json;
        this.saldo = 0.0;
        this.registrosCtaCte.forEach( reg => {
          if (!isNullOrUndefined(reg.comprobante_compras)) {
            reg.ptoventaynumero = ('000' + reg.comprobante_compras.punto_venta).slice(-4) + '-' + ('0000000' + reg.comprobante_compras.numero).slice(-8);
          } else if (!isNullOrUndefined(reg.orden_pago)) {
            reg.ptoventaynumero = '0';
          }
          this.saldo += +reg.debe;
          this.saldo -= +reg.haber;
          reg.saldo = this.saldo.toFixed(2);
        });
        setTimeout(() => {$('#table').DataTable().columns.adjust(); }, 100);
      }));
    }
  }

  mostrarModalVer(ctaCteProveedor: CtaCteProveedor) {
    this.ctaCteProveedorSeleccionada = ctaCteProveedor;
    if (!isNullOrUndefined(ctaCteProveedor.comprobante_compras_id)) {
      this.subscriptions.add(this.apiService.get('comprobantescompra/' + ctaCteProveedor.comprobante_compras_id).subscribe((json: ComprobanteCompra) => {
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
      }));
    } else {
      this.subscriptions.add(this.apiService.get('ordenespago/' + ctaCteProveedor.orden_pago_id).subscribe( (json: OrdenPago) => {
        this.comprobante = json;
        this.comprobante.tipo_comp_compras = ctaCteProveedor.tipo_comp_compras;
        this.verComprTipo = ctaCteProveedor.tipo_comp_compras.nombre;
        // this.comprobante.numero = ('000000' + this.comprobante.numero).slice(-8);
        // this.comprobante.punto_venta = ('000' + this.comprobante.punto_venta).slice(-4);
        this.comprobante.importe_total = this.comprobante.importe;
        this.comprobante.orden_pago_items.forEach((item: ItemOrdenPago) => {
          if (!item.anticipo) {
            item.ptoventaynumero = ('000' + item.comprobante_compra.punto_venta).slice(-4) + '-' + ('0000000' + item.comprobante_compra.numero).slice(-8);
          }
        });
        const flatOrdenPagoValores = [];
        this.comprobante.orden_pago_valores.forEach(valor => {
          valor.nombre = valor.medio_pago.nombre;
          switch (valor.nombre) {
            case 'Depósito':
              valor.depositos.forEach( deposito => {
                const newValor: any = {};
                newValor.nombre = valor.nombre + ' - ' + deposito.cuenta.banco.nombre;
                newValor.numero = deposito.numero;
                newValor.importe = deposito.importe;
                flatOrdenPagoValores.push(newValor);
              });
              break;
            case 'Cheque Propio':
              valor.cheques_propios.forEach( cheque => {
                const newValor: any = {};
                newValor.nombre = valor.nombre + ' - ' + cheque.cuenta_bancaria.banco.nombre;
                newValor.numero = cheque.numero;
                newValor.fecha = cheque.fecha_vencimiento;
                newValor.importe = cheque.importe;
                flatOrdenPagoValores.push(newValor);
              });
              break;
            default:
              flatOrdenPagoValores.push(valor);
          }
        });
        this.comprobante.orden_pago_valores = flatOrdenPagoValores;
        (<any>$('#modalVer')).modal('show');
      }));
    }
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

    this.subscriptions.add(this.apiService.downloadPDF('proveedores/cuentacorriente/reporte', {
        'proveedor_id': this.proveedorCtaCteSeleccionado.id,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }
    ).subscribe(
      (res) => {
        this.impresionService.imprimir(res);
      }
    ));
  }
}
