import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import { ApiService } from '../../service/api.service';
import {ComprobanteCompra} from '../../domain/comprobanteCompra';
import {PeriodoFiscal} from '../../domain/periodoFiscal';
import {TipoComprobanteCompra} from '../../domain/tipoComprobanteCompra';
import {AlertService} from '../../service/alert.service';
import {isNullOrUndefined} from 'util';
import {DataTableDirective} from 'angular-datatables';
import {Proveedor} from '../../domain/proveedor';
import {IMyDpOptions} from 'mydatepicker';
import {ComprobanteCompraImportes} from '../../domain/comprobanteCompraImportes';
import {ComprobanteCompraRetencion} from '../../domain/comprobanteCompraRetencion';
import {TipoRetencion} from '../../domain/tipoRetencion';

@Component({
  selector: 'app-comprobantes-compra',
  templateUrl: './comprobantes-compra.component.html',
  styleUrls: ['./comprobantes-compra.component.css']
})
export class ComprobantesCompraComponent implements OnInit, AfterViewChecked, OnDestroy {
  submitted = false;
  submittedInner = false;
  mostrarTabla = false;
  excedeImporteTotal = false;
  flagElimino = false;
  activeTabImportes = true;
  activeTabRetenciones = false;
  enNuevo: boolean;
  modalTitle: string;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;
  dtOptions: any = {};
  dtRetOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  comprobantes: ComprobanteCompra[] = [];
  proveedores: Proveedor[] = [];
  periodos: PeriodoFiscal[] = [];
  tiposComprobanteCompra: TipoComprobanteCompra[] = [];
  tipoRetenciones: TipoRetencion[] = [];
  retenciones: ComprobanteCompraRetencion[] = [];
  retencionesBackup: ComprobanteCompraRetencion[] = [];
  comprobanteSeleccionado: ComprobanteCompra = new ComprobanteCompra;
  comprobanteCompraOriginal: ComprobanteCompra;
  proveedorSeleccionado: Proveedor = new Proveedor;
  periodoSeleccionado: PeriodoFiscal = new PeriodoFiscal;
  tipoComprobanteCompraSeleccionado: TipoComprobanteCompra = new TipoComprobanteCompra;
  CCimportesSeleccionado: ComprobanteCompraImportes = new ComprobanteCompraImportes;
  CCretencionesSeleccionado: ComprobanteCompraRetencion = new ComprobanteCompraRetencion;
  existe = false;
  existeComprobanteDatos = false;

  // parametros filtrar comprobantes de compra
  parametroReporteFiltrarPorProveedor: Boolean;
  parametroReporteProveedor: Number;
  parametroReporteFiltrarPorTipo: Boolean;
  parametroReporteTipo: Number;
  parametroReporteFiltrarPorPeriodo: Boolean;
  parametroReportePeriodo: Number;

  constructor(private apiService: ApiService, private cdRef: ChangeDetectorRef, private alertService: AlertService) { }

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
          text: 'Nuevo Comprobante de Compra',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }, {
          text: 'Filtrar',
          key: '2',
          className: 'btn btn-default',
          action: () => {
            this.mostrarModalFiltrar();
          }
        }
      ]
    };
    this.dtRetOptions = {
      paging: false,
      searching: false,
      autoWidth: true,
      language: {
        'processing':     'Procesando...',
        'lengthMenu':     'Mostrar _MENU_ registros',
        'zeroRecords':    false,
        'emptyTable':     false,
        'info':           'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        'infoEmpty':      '',
        'infoFiltered':   '(filtrado de un total de _MAX_ registros)',
        'infoPostFix':    '',
        'search':         'Buscar:',
        'url':            '',
        // 'infoThousands':  ',',
        'loadingRecords': 'Cargando...',
        'aria': {
          'sortAscending':  ': Activar para ordenar la columna de manera ascendente',
          'sortDescending': ': Activar para ordenar la columna de manera descendente'
        }
      },
      columnDefs: [
        {
          'targets': 0,
          'searchable': false,
          'orderable': false
        }, {
          'targets': 1,
          'searchable': false,
          'orderable': false
        }, {
          'targets': 2,
          'searchable': false,
          'orderable': false
        }, {
          'targets': 3,
          'searchable': false,
          'orderable': false
        }, {
          'targets': 4,
          'searchable': false,
          'orderable': false
        }],
      dom: 'lfrtip',
      buttons: [
      ]
    };
    setTimeout(() => { this.mostrarTabla = true; }, 350);

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
      alignSelectorRight: true,
    };

    const options = JSON.parse(JSON.stringify(this.myDatePickerOptions));
    const today = new Date();
    options.disableSince = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate() + 1 // TODO validar cuando está en el ultimo dia del mes!
    };
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.myDatePickerOptions = options;

    this.apiService.get('comprobantescompra') // TODO definir qué se va a mostrar en la pantalla cuando se carga por primera vez
      .subscribe(json => {
        this.comprobantes = json;
        this.dtTrigger.next();
      });

    this.apiService.get('proveedores')
      .subscribe(json => {
        this.proveedores = json;
      });

    this.apiService.get('periodosfiscales')
      .subscribe(json => {
        this.periodos = json;
      });

    this.apiService.get('tipocomprobantescompra')
      .subscribe(json => {
        this.tiposComprobanteCompra = json;
      });

    this.apiService.get('tiporetenciones')
      .subscribe(json => {
        this.tipoRetenciones = json;
      });
  }

  mostrarModalNuevo() {
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.modalTitle = 'Nuevo comprobante de compra';
    this.enNuevo = true;
    this.comprobanteSeleccionado = new ComprobanteCompra;
    this.proveedorSeleccionado = new Proveedor;
    this.CCimportesSeleccionado = new ComprobanteCompraImportes;
    this.CCimportesSeleccionado.importe_neto_no_gravado = 0;
    this.CCretencionesSeleccionado = new ComprobanteCompraRetencion;
    this.retenciones = [];
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEditar(comprobantecompra: ComprobanteCompra) {
    this.existe = false;
    this.modalTitle = 'Editar comprobante de compra';
    this.enNuevo = false;
    this.comprobanteCompraOriginal = comprobantecompra;
    this.comprobanteSeleccionado = JSON.parse(JSON.stringify(comprobantecompra));
    this.tipoComprobanteCompraSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.tipo_comp_compras));
    this.proveedorSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.proveedor));
    this.periodoSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.periodo));
    this.CCimportesSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.comprobante_compra_importes));
    this.retenciones = JSON.parse(JSON.stringify(comprobantecompra.comprobante_compra_retenciones));
    this.retenciones.forEach(x => {
      x.tipoRetencion = this.tipoRetenciones.find(t => t.id === x.retencion_id);
    });
    let month = this.comprobanteSeleccionado.fecha.toString().slice(5, 7);
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.comprobanteSeleccionado.fecha.toString().slice(8, 10);
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.fecha =  {
      date: {
        year: this.comprobanteSeleccionado.fecha.toString().slice(0, 4),
        month: month,
        day: day
      }
    };
  }

  private mostrarModalFiltrar() {
    this.parametroReporteFiltrarPorProveedor = false;
    this.parametroReporteProveedor = 0;
    this.parametroReporteFiltrarPorTipo = false;
    this.parametroReporteTipo = 0;
    this.parametroReporteFiltrarPorPeriodo = false;
    this.parametroReportePeriodo = 0;
    (<any>$('#modalReporte')).modal('show');
    this.comprobanteSeleccionado = new ComprobanteCompra;
  }

  mostrarModalEliminar(comprobanteCompra: ComprobanteCompra) {
    this.comprobanteSeleccionado = comprobanteCompra;
  }

  eliminar() {
    const index: number = this.comprobantes.indexOf(this.comprobanteSeleccionado);
    if (index !== -1) {
      this.comprobantes.splice(index, 1);
    }
    this.recargarTabla();
    this.apiService.delete('comprobantescompra/' + this.comprobanteSeleccionado.id).subscribe();
    this.cerrar(null);
  }

  editarONuevo(f: any, fo: any) {
    this.submitted = true;
    this.flagElimino = false;
    if (f.valid) {
      const comprobanteAEnviar = this.setComprobanteParametros();
      this.cerrar(fo);
      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('comprobantescompra', comprobanteAEnviar).subscribe(
          json => {
            this.comprobantes.push(json);
            this.recargarTabla();
          }
        );
      } else {
        // comprobanteAEnviar.comprobante_compra_retenciones.forEach(x => x.id = null);
        this.apiService.put('comprobantescompra/' + comprobanteAEnviar.id, comprobanteAEnviar).subscribe(
          json => {
            Object.assign(this.comprobanteCompraOriginal, json);
          }
        );
      }
    }
  }

  agregarRetencion(f: any) {
    this.submittedInner = true;
    if (f.valid) {
      this.CCretencionesSeleccionado.retencion_id = this.CCretencionesSeleccionado.tipoRetencion.id;
      this.retenciones.push(this.CCretencionesSeleccionado);
      this.CCretencionesSeleccionado = new ComprobanteCompraRetencion;
      this.CCretencionesSeleccionado.retencion_id = 0;
      this.submittedInner = false;
      this.excedeImporteTotal = false;
    }
  }

  eliminarRetencion(retencion: ComprobanteCompraRetencion) {
    this.retencionesBackup = Object.assign({}, this.retenciones);
    this.flagElimino = true;
    const index: number = this.retenciones.indexOf(retencion);
    if (index !== -1) {
      this.retenciones.splice(index, 1);
    }
    // this.apiService.delete('clientes/' + this.clienteSeleccionado.id).subscribe();
  }

  cerrar(f) {
    this.submitted = false;
    this.submittedInner = false;
    this.activeTabImportes = true;
    this.activeTabRetenciones = false;
    if (this.flagElimino) {
      // si le dio a cancelar pero habia eliminado retenciones, deshago esa eliminacion
      this.comprobanteCompraOriginal.comprobante_compra_retenciones = JSON.parse(JSON.stringify(this.retencionesBackup));
    }
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 200);
    }
  }

  private recargarTabla() {
    // TODO buscar otra forma de reflejar los cambios en la tabla
    this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  OnProveedorChanged(value) {
    this.proveedorSeleccionado = this.proveedores.find( p => p.id === +value );
    this.checkExists();
  }

  OnTipoComprChanged(value) {
    this.tipoComprobanteCompraSeleccionado = this.tiposComprobanteCompra.find( t => t.id === +value );
    this.checkExists();
  }

  OnPeriodoChanged(value) {
    this.periodoSeleccionado = this.periodos.find( x => x.id === +value );
  }

  OnImporteTotalChange(value) {
    if (this.comprobanteSeleccionado.saldo !== null) {
      this.comprobanteSeleccionado.saldo = (+value);
    }
    const diferencia = (+value) - this.CCimportesSeleccionado.importe_neto_no_gravado;
    this.ActualizarNetoGravado(diferencia);
    // se llama al OnAlicuotaChange para que actualice el monto del importe_iva
    this.OnAlicuotaIvaChange(this.CCimportesSeleccionado.alicuota_iva);
  }

  OnNetoNoGravadoChange(value) {
    const diferencia = this.comprobanteSeleccionado.importe_total - (+value);
    this.ActualizarNetoGravado(diferencia);
    // se llama al OnAlicuotaChange para que actualice el monto del importe_iva
    this.OnAlicuotaIvaChange(this.CCimportesSeleccionado.alicuota_iva);
  }

  OnAlicuotaIvaChange(value) {
    if (this.comprobanteSeleccionado.importe_total > 0 && this.CCimportesSeleccionado.alicuota_iva > 0) {
      const diferencia = this.comprobanteSeleccionado.importe_total - this.CCimportesSeleccionado.importe_neto_no_gravado;
      this.CCimportesSeleccionado.importe_neto_gravado = (+(diferencia / (((+value) + 100) / 100)).toFixed(2));
      this.CCimportesSeleccionado.importe_iva = (+((this.CCimportesSeleccionado.importe_neto_gravado * (+value)) / 100).toFixed(2));
      this.SugerirBaseImponible();
    }
  }

  ActualizarNetoGravado(diferencia: number) {
    if (this.comprobanteSeleccionado.importe_total > 0 && this.CCimportesSeleccionado.alicuota_iva > 0) {
      this.CCimportesSeleccionado.importe_neto_gravado = (+(diferencia / ((this.CCimportesSeleccionado.alicuota_iva + 100) / 100)).toFixed(2));
      this.CCimportesSeleccionado.importe_iva = (+((this.CCimportesSeleccionado.importe_neto_gravado * this.CCimportesSeleccionado.alicuota_iva) / 100).toFixed(2));
      this.SugerirBaseImponible();
    }
  }

  SugerirBaseImponible() {
    this.CCretencionesSeleccionado.base_imponible = this.CCimportesSeleccionado.importe_neto_gravado;
  }

  OnBaseImponibleChange(value) {
    if ((+value) >= this.comprobanteSeleccionado.importe_total) {
      this.excedeImporteTotal = true;
    } else {
      this.excedeImporteTotal = false;
    }
    this.ActualizarImporteRetencion();
  }

  OnTipoRetencionChange(value) {
    if ((+value) > 0) {
      this.CCretencionesSeleccionado.tipoRetencion = this.tipoRetenciones.find(x => x.id === (+value));
      this.CCretencionesSeleccionado.alicuota = this.tipoRetenciones.find(x => x.id === (+value)).alicuota;
      this.ActualizarImporteRetencion();
    }
  }

  ActualizarImporteRetencion() {
    const retencion = this.CCretencionesSeleccionado;
    if (retencion.base_imponible !== null && retencion.alicuota !== null) {
      retencion.importe = (+((retencion.base_imponible * retencion.alicuota) / 100).toFixed(2));
    }
  }

  setComprobanteParametros(): ComprobanteCompra {
    const comprobanteAEnviar = new ComprobanteCompra;
    Object.assign(comprobanteAEnviar, this.comprobanteSeleccionado);
    comprobanteAEnviar.tipo_comp_compras = JSON.parse(JSON.stringify(this.tipoComprobanteCompraSeleccionado));
    comprobanteAEnviar.tipo_comp_compras_id = this.tipoComprobanteCompraSeleccionado.id;
    comprobanteAEnviar.periodo = JSON.parse(JSON.stringify(this.periodoSeleccionado));
    comprobanteAEnviar.periodo_id = this.periodoSeleccionado.id;
    comprobanteAEnviar.proveedor = JSON.parse(JSON.stringify(this.proveedorSeleccionado));
    comprobanteAEnviar.proveedor_id = this.proveedorSeleccionado.id;
    comprobanteAEnviar.proveedor_nombre = this.proveedorSeleccionado.nombre;
    comprobanteAEnviar.proveedor_tipo_resp = this.proveedorSeleccionado.tipo_responsable;
    comprobanteAEnviar.proveedor_cuit = this.proveedorSeleccionado.cuit;
    comprobanteAEnviar.comprobante_compra_importes = new ComprobanteCompraImportes;
    comprobanteAEnviar.anulado = false;
    Object.assign(comprobanteAEnviar.comprobante_compra_importes, this.CCimportesSeleccionado);
    const anio = this.fecha.date.year;
    const mes = ('0' + this.fecha.date.month).slice(-2);
    const dia = ('0' + this.fecha.date.day).slice(-2);
    comprobanteAEnviar.fecha = anio + '-' + mes + '-' + dia;
    comprobanteAEnviar.comprobante_compra_retenciones = [];
    this.retenciones.forEach(x => comprobanteAEnviar.comprobante_compra_retenciones.push(JSON.parse(JSON.stringify(x))));
    return comprobanteAEnviar;
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

  onParametroReporteProveedorChanged(value) {
    this.parametroReporteProveedor = (+value);
  }

  onParametroReporteTipoChanged(value) {
    this.parametroReporteTipo = (+value);
  }

  onParametroReportePeriodoChanged(value) {
    this.parametroReportePeriodo = (+value);
  }

  generarListaFiltrada() {
    if (!this.parametroReporteFiltrarPorProveedor) {
      this.parametroReporteProveedor = 0;
    }
    if (!this.parametroReporteFiltrarPorTipo) {
      this.parametroReporteTipo = 0;
    }
    if (!this.parametroReporteFiltrarPorPeriodo) {
      this.parametroReportePeriodo = 0;
    }
    this.apiService.get('comprobantescompra/filtrar', {
        'proveedor': this.parametroReporteProveedor,
        'tipo': this.parametroReporteTipo,
        'periodo': this.parametroReportePeriodo
      })
      .subscribe(json => {
        this.comprobantes = json;
        this.recargarTabla();
      });
  }

  OnTabImportesClicked() {
    this.activeTabImportes = true;
    this.activeTabRetenciones = false;
  }

  OnTabRetencionesClicked() {
    this.activeTabRetenciones = true;
    this.activeTabImportes = false;
  }

  checkExists() {
    // TODO chequear si la performance de llamar a la API es buena o tiene mucha latencia
    if (this.proveedorSeleccionado.id !== null && this.tipoComprobanteCompraSeleccionado.id !== null &&
      this.comprobanteSeleccionado.punto_venta !== null && this.comprobanteSeleccionado.numero !== null) {
      this.apiService.get('comprobantescompra/proveedor/' + this.proveedorSeleccionado.id).subscribe(
        json => {
          if (json === '') {
            this.existeComprobanteDatos = false;
          } else {
            const comprobante = json.find(
              c => c.proveedor_id === this.proveedorSeleccionado.id
              && c.tipo_comp_compras_id === this.tipoComprobanteCompraSeleccionado.id
              && (+c.punto_venta) === this.comprobanteSeleccionado.punto_venta
              && (+c.numero) === this.comprobanteSeleccionado.numero
            );
            if (comprobante === undefined) {
              this.existeComprobanteDatos = false;
            } else {
              if (comprobante.id === this.comprobanteSeleccionado.id) {
                this.existeComprobanteDatos = false;
              } else {
                this.existeComprobanteDatos = true;
              }
            }
          }
        });
    }
  }
}
