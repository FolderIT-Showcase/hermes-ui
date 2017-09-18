import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import { ApiService } from '../../shared/services/api.service';
import {ComprobanteCompra} from '../../shared/domain/comprobanteCompra';
import {PeriodoFiscal} from '../../shared/domain/periodoFiscal';
import {TipoComprobanteCompra} from '../../shared/domain/tipoComprobanteCompra';
import {isNullOrUndefined} from 'util';
import {DataTableDirective} from 'angular-datatables';
import {Proveedor} from '../../shared/domain/proveedor';
import {IMyDpOptions} from 'mydatepicker';
import {ComprobanteCompraImportes} from '../../shared/domain/comprobanteCompraImportes';
import {ComprobanteCompraRetencion} from '../../shared/domain/comprobanteCompraRetencion';
import {TipoRetencion} from '../../shared/domain/tipoRetencion';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {HelperService} from '../../shared/services/helper.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-comprobantes-compra',
  templateUrl: './comprobantes-compra.component.html',
  styleUrls: ['./comprobantes-compra.component.css']
})
export class ComprobantesCompraComponent implements OnInit, AfterViewChecked, OnDestroy {
  submitted = false;
  submittedInner = false;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  excedeImporteTotal = false;
  flagElimino = false;
  activeTabImportes = true;
  activeTabRetenciones = false;
  enNuevo: boolean;
  modalTitle: string;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  tipos_responsable = [];
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
  private subscriptions: Subscription = new Subscription();

  // parametros filtrar comprobantes de compra
  parametroReporteFiltrarPorProveedor: Boolean;
  parametroReporteProveedor: Number;
  parametroReporteFiltrarPorTipo: Boolean;
  parametroReporteTipo: Number;
  parametroReporteFiltrarPorPeriodo: Boolean;
  parametroReportePeriodo: Number;
  parametroReporteFiltrarPorMonto: Boolean;
  parametroReporteMontoMin: Number;
  parametroReporteMontoMax: Number;

  constructor(private apiService: ApiService,
              private cdRef: ChangeDetectorRef,
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
      aaSorting: [0, 'DESC'],
      language: HelperService.defaultDataTablesLanguage(),
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
    setTimeout(() => { this.mostrarTabla = true; }, 350);

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
    this.navbarTitleService.setTitle('Gestión de Comprobantes de Compra');

    const options = JSON.parse(JSON.stringify(this.myDatePickerOptions));
    const today = new Date();
    options.disableSince = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate() + 1 // TODO validar cuando está en el ultimo dia del mes!
    };
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.myDatePickerOptions = options;

    this.subscriptions.add(this.apiService.get('comprobantescompra') // TODO definir qué se va a mostrar en la pantalla cuando se carga por primera vez
      .subscribe(json => {
        this.mostrarBarraCarga = false;
        this.mostrarTabla = true;
        this.comprobantes = json;
        this.dtTrigger.next();
      },
        () => {
          this.mostrarBarraCarga = false;
        }));

    // TODO: todos estos request a la api tendrían que hacerse si this.mostrarTabla===true (manejar asincronia)
    this.subscriptions.add(this.apiService.get('proveedores')
      .subscribe(json => {
        this.proveedores = json;
        this.proveedores.forEach(
          proveedor => {
            if (!isNullOrUndefined(this.tipos_responsable.find(x => x.clave === proveedor.tipo_responsable))) {
              proveedor.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === proveedor.tipo_responsable).nombre;
            }
          }
        );
      }));

    this.subscriptions.add(this.apiService.get('periodosfiscales')
      .subscribe(json => {
        this.periodos = json;
      }));

    this.subscriptions.add(this.apiService.get('tipocomprobantescompra')
      .subscribe(json => {
        this.tiposComprobanteCompra = json;
      }));

    this.subscriptions.add(this.apiService.get('tiporetenciones')
      .subscribe(json => {
        this.tipoRetenciones = json;
      }));
  }

  mostrarModalNuevo() {
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.modalTitle = 'Nuevo comprobante de compra';
    this.enNuevo = true;
    this.comprobanteSeleccionado = new ComprobanteCompra;
    this.proveedorSeleccionado = new Proveedor;
    this.tipoComprobanteCompraSeleccionado = new TipoComprobanteCompra;
    this.periodoSeleccionado = new PeriodoFiscal;
    this.CCimportesSeleccionado = new ComprobanteCompraImportes;
    // this.CCimportesSeleccionado.importe_neto_no_gravado = 0;
    this.CCretencionesSeleccionado = new ComprobanteCompraRetencion;
    this.retenciones = [];
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEditar(comprobantecompra: ComprobanteCompra) {
    this.enNuevo = false;
    this.existe = false;
    this.modalTitle = 'Editar comprobante de compra';
    this.comprobanteCompraOriginal = comprobantecompra;
    this.comprobanteSeleccionado = JSON.parse(JSON.stringify(comprobantecompra));
    this.tipoComprobanteCompraSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.tipo_comp_compras));
    this.proveedorSeleccionado = JSON.parse(JSON.stringify(comprobantecompra.proveedor));
    this.proveedorSeleccionado.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === this.proveedorSeleccionado.tipo_responsable).nombre;
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
    this.subscriptions.add(this.apiService.delete('comprobantescompra/' + this.comprobanteSeleccionado.id).subscribe());
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
        this.subscriptions.add(this.apiService.post('comprobantescompra', comprobanteAEnviar).subscribe(
          json => {
            this.comprobantes.push(json);
            this.recargarTabla();
          }
        ));
      } else {
        this.subscriptions.add(this.apiService.put('comprobantescompra/' + comprobanteAEnviar.id, comprobanteAEnviar).subscribe(
          json => {
            Object.assign(this.comprobanteCompraOriginal, json);
          }
        ));
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
    this.excedeImporteTotal = (+value) >= this.comprobanteSeleccionado.importe_total;
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
    this.subscriptions.unsubscribe();
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

  onParametroReporteMontoMinChanged(value) {
    this.parametroReporteMontoMin = (+value);
  }

  onParametroReporteMontoMaxChanged(value) {
    this.parametroReporteMontoMax = (+value);
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
    if (!this.parametroReporteFiltrarPorMonto) {
      this.parametroReporteMontoMin = -1;
      this.parametroReporteMontoMax = -1;
    }
    if (!this.parametroReporteFiltrarPorMonto) {
      this.parametroReporteMontoMin = -1;
      this.parametroReporteMontoMax = -1;
    }
    if (this.parametroReporteProveedor > 0 ||
        this.parametroReporteTipo > 0 ||
        this.parametroReportePeriodo > 0 ||
        this.parametroReporteMontoMin > -1 ||
        this.parametroReporteMontoMax > -1) {
      if (this.parametroReporteMontoMin > 0 && this.parametroReporteMontoMax < 1) {
        this.parametroReporteMontoMax = -1;
      }
      this.subscriptions.add(this.apiService.get('comprobantescompra/filtrar', {
        'proveedor': this.parametroReporteProveedor,
        'tipo': this.parametroReporteTipo,
        'periodo': this.parametroReportePeriodo,
        'montomin': this.parametroReporteMontoMin,
        'montomax': this.parametroReporteMontoMax
      })
        .subscribe(json => {
          this.comprobantes = json;
          this.recargarTabla();
        }));
      this.parametroReporteFiltrarPorMonto = false;
      this.parametroReporteMontoMax = null;
      this.parametroReporteMontoMin = null;
    } else {
      this.cerrar(null);
    }
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
    if (!isNullOrUndefined(this.proveedorSeleccionado.id) && !isNullOrUndefined(this.tipoComprobanteCompraSeleccionado.id) &&
      !isNullOrUndefined(this.comprobanteSeleccionado.punto_venta) && !isNullOrUndefined(this.comprobanteSeleccionado.numero)) {
      this.subscriptions.add(this.apiService.get('comprobantescompra/proveedor/' + this.proveedorSeleccionado.id).subscribe(
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
              this.existeComprobanteDatos = comprobante.id !== this.comprobanteSeleccionado.id;
            }
          }
        }));
    }
  }
}
