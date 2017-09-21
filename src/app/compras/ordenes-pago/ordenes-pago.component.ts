import {AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Proveedor} from '../../shared/domain/proveedor';
import {IMyDate, IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../shared/services/api.service';
import {AlertService} from '../../shared/services/alert.service';
import {Observable} from 'rxjs/Observable';
import {ItemOrdenPago} from '../../shared/domain/itemOrdenPago';
import {OrdenPago} from '../../shared/domain/ordenPago';
import {TipoComprobante} from '../../shared/domain/tipocomprobante';
import {isNullOrUndefined} from 'util';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {HelperService} from '../../shared/services/helper.service';
import {Subject} from 'rxjs/Subject';
import {Banco} from '../../shared/domain/banco';
import {Cheque} from '../../shared/domain/cheque';
import {TipoTarjeta} from '../../shared/domain/tipoTarjeta';
import {CuentaBancaria} from '../../shared/domain/cuentaBancaria';
import {Tarjeta} from '../../shared/domain/tarjeta';
import {Deposito} from '../../shared/domain/deposito';
import {MedioPago} from '../../shared/domain/medioPago';
import {Subscription} from 'rxjs/Subscription';
import {ComprobanteCompra} from '../../shared/domain/comprobanteCompra';
import {SeleccionChequesComponent} from './seleccion-cheques/seleccion-cheques.component';
import {Cliente} from '../../shared/domain/cliente';

@Component({
  selector: 'app-ordenes-pago',
  templateUrl: './ordenes-pago.component.html',
  styleUrls: ['./ordenes-pago.component.css']
})
export class OrdenesPagoComponent implements OnInit, AfterViewInit, OnDestroy {
  chequesTerceros: Cheque[];
  marginRedondeo = 10;
  depositos: Deposito[] = [];
  listaTiposTarjeta: TipoTarjeta[] = [];
  total: string | number = 0;
  cheques: Cheque[] = [];
  ordenPago: OrdenPago;
  itemsOrdenPago: ItemOrdenPago[] = [];
  proveedor: Proveedor;
  proveedorAsync: string;
  listaProveedores: Proveedor[];
  proveedores: any;
  proveedorCodAsync: string;
  proveedoresCod: any;
  dtOptions: any = {};
  busquedaProveedor: string;
  busquedaProveedoreseleccionado: Proveedor;
  busquedaProveedores: Proveedor[];
  @ViewChild('typeaheadNombreProveedor')
  private typeaheadNombreProveedorElement: ElementRef;
  @ViewChild('tabla')
  private tabla: ElementRef;
  @ViewChild('modalContainer', { read: ViewContainerRef }) container;
  typeaheadNombreProveedorNoResults: boolean;
  typeaheadCodigoProveedorNoResults: boolean;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  tipoComprobante: TipoComprobante;
  comprobantesAMostrar: ComprobanteCompra[];
  comprobantes: ComprobanteCompra[];
  modificado = false;
  puedeSalir: Subject<Boolean> = new Subject;
  listaBancos: Banco[] = [];
  listaClientes: Cliente[] = [];
  listaCheques: Cheque[] = [];
  allProveedores: Proveedor[] = [];
  redondeo: string | number = 0;
  listaCuentas: CuentaBancaria[] = [];
  tarjetas: Tarjeta[] = [];
  totalCheques: string | number = 0;
  totalChequesTerceros: string | number = 0;
  totalTarjetas: string | number = 0;
  totalDepositos: string | number = 0;
  totalEfectivo: string | number = 0;
  componentRef: any;
  mediosPago: MedioPago[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService,
              private resolver: ComponentFactoryResolver) {
    this.proveedores = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('proveedores/nombre/' + this.proveedorAsync).subscribe(json => {
        this.listaProveedores = json;
        observer.next(json);
      }));
    });

    this.proveedoresCod = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('proveedores/codigo/' + this.proveedorCodAsync).subscribe(json => {
        if (json === '') {
          this.listaProveedores = [];
          observer.next([]);
        } else {
          this.listaProveedores = [json];
          observer.next([json]);
        }
      }));
    });
  }

  ngOnInit() {
    const language = HelperService.defaultDataTablesLanguage();
    language.zeroRecords = '';
    language.emptyTable = '';
    this.dtOptions = {
      language: language,
      dom: 'tp',
      scrollY: '57vh',
      paging: false,
      columnDefs: [ {
        'targets': 0,
        'searchable': false,
        'orderable': false,
        'width': '12%'
      }, {
        'targets': 1,
        'searchable': false,
        'orderable': false,
        'width': '11%'
      }, {
        'targets': 2,
        'searchable': false,
        'orderable': false,
        'width': '23%'
      }, {
        'targets': 3,
        'searchable': false,
        'orderable': false,
        'width': '12%'
      }, {
        'targets': 4,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '12%'
      }, {
        'targets': 6,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 7,
        'searchable': false,
        'orderable': false,
        'width': '5%'
      }]
    };

    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();

    this.inicializar();
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreProveedorElement.nativeElement.focus();
  }

  inicializar() {
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.proveedorAsync = '';
    this.proveedorCodAsync = '';
    this.itemsOrdenPago = [];
    this.proveedor = new Proveedor;
    this.ordenPago = new OrdenPago;
    this.ordenPago.importe = 0;
    this.ordenPago.punto_venta = '0001';
    this.totalCheques = 0;
    this.totalTarjetas = 0;
    this.totalDepositos = 0;
    this.totalEfectivo = 0;
    this.tarjetas = [];
    this.cheques = [];
    this.depositos = [];
    this.submitted = false;
    this.modificado = false;
    this.navbarTitleService.setTitle('Orden de Pago');
    this.cargarBancos();
    this.cargarClientes();
    this.cargarCheques();
    this.cargarProveedores();
    this.cargarCuentas();
    this.cargarTiposTarjeta();
    this.cargarMediosPago();
  }

  onProveedorChanged(event) {
    this.modificado = true;
    this.typeaheadNombreProveedorNoResults = false;
    this.typeaheadCodigoProveedorNoResults = false;
    this.proveedor = event;
    this.proveedorCodAsync = this.proveedor.codigo;
    this.proveedorAsync = this.proveedor.nombre;
    this.subscriptions.add(this.apiService.get('ordenespago/comprobantes', {'proveedor': this.proveedor.id}).subscribe( json => {
      this.comprobantes = json;
      this.comprobantes.forEach(reg => {
        reg.ptoventaynumero = ('000' + reg.punto_venta).slice(-4) + '-' + ('0000000' + reg.numero).slice(-8);
      });

      this.itemsOrdenPago = [];
      this.mostrarModalComprobantes();
    }));
    this.subscriptions.add(this.apiService.get('tipocomprobantes/' + 'recibo' + '/' + this.proveedor.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      let month = this.tipoComprobante.ultima_fecha.slice(5, 7);
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      let day = this.tipoComprobante.ultima_fecha.slice(8, 10);
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      const options = JSON.parse(JSON.stringify(this.myDatePickerOptions));
      options.disableUntil = {
        year: +this.tipoComprobante.ultima_fecha.slice(0, 4),
        month: +month,
        day: +day
      };

      if (this.fechaMayor(options.disableUntil, this.fecha)) {
        const today = new Date();
        this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
      }
      this.myDatePickerOptions = options;

      // this.subscriptions.add(this.apiService.get('contadores/' + this.ordenPago.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
      //   if (contador === '') {
      //     this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.ordenPago.punto_venta, false);
      //   } else {
      //     this.ordenPago.numero = +contador.ultimo_generado + 1;
      //     this.ordenPago.numero = ('0000000' + this.ordenPago.numero).slice(-8);
      //   }
      // }));
    }));
  }

  private fechaMayor(primerFecha: IMyDate, segundaFecha: any): boolean {
    return (primerFecha.year > segundaFecha.date.year)
      ||  ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month > segundaFecha.date.month))
      || ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month === segundaFecha.date.month)
        && primerFecha.day > segundaFecha.date.day);
  }

  changeTypeaheadNombreProveedorNoResults(e: boolean): void {
    this.typeaheadNombreProveedorNoResults = e;
  }

  changeTypeaheadCodigoProveedorNoResults(e: boolean): void {
    this.typeaheadCodigoProveedorNoResults = e;
  }

  typeaheadNombreProveedorOnBlur() {
    if (!isNullOrUndefined(this.proveedorAsync)
      && this.proveedorAsync.length > 0
      && this.proveedorAsync !== this.proveedor.nombre
      && !this.typeaheadNombreProveedorNoResults) {
      this.proveedor = this.listaProveedores[0];
      this.onProveedorChanged(this.proveedor);
    }
  }

  typeaheadCodProveedorOnBlur() {
    if (!isNullOrUndefined(this.proveedorCodAsync)
      && this.proveedorCodAsync.length > 0
      && this.proveedorCodAsync !== this.proveedor.codigo
      && !this.typeaheadCodigoProveedorNoResults) {
      this.proveedor = this.listaProveedores[0];
      this.onProveedorChanged(this.proveedor);
    }
  }

  buscarProveedores() {
    this.busquedaProveedoreseleccionado = null;
    this.subscriptions.add(this.apiService.get('proveedores/buscar/' + this.busquedaProveedor).subscribe( json => {
      this.busquedaProveedores = json;
    }));
  }

  confirmarBusquedaProveedor () {
    this.proveedorAsync = this.busquedaProveedoreseleccionado.nombre;
    this.proveedorCodAsync = this.busquedaProveedoreseleccionado.codigo;
    this.onProveedorChanged(this.busquedaProveedoreseleccionado);
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  private mostrarModalComprobantes() {
    this.comprobantesAMostrar = this.comprobantes.filter(reg => {
      return !this.itemsOrdenPago.find(item => item.comprobante.id === reg.id);
    });
    const anticipo = new ComprobanteCompra();
    anticipo.saldo = 999999999;
    anticipo.importe_total = 0.00;
    anticipo.tipo_comp_compras = new TipoComprobante();
    anticipo.tipo_comp_compras.nombre = 'Anticipo';
    anticipo.fecha = '-';
    anticipo.ptoventaynumero = '-';
    this.comprobantesAMostrar.push(anticipo);
    this.comprobantesAMostrar.forEach(reg => {
      reg.en_lista = false;
    });
    (<any>$('#modalComprobantes')).modal('show');
  }

  toggleAll(value) {
    this.comprobantesAMostrar.forEach( reg => {
      reg.en_lista = value;
    });
  }

  agregarComprobantes() {
    this.comprobantesAMostrar.forEach( reg => {
      if (reg.en_lista) {
        this.agregarItem(reg);
      }
    });
    this.calcularImportes();
  }

  agregarItem(comprobante: ComprobanteCompra) {
    const item = new ItemOrdenPago();
    item.comprobante = comprobante;
    if (comprobante.tipo_comp_compras.nombre !== 'Anticipo') {
      item.comprobante_compra_id = comprobante.id;
      item.importe = (+comprobante.saldo).toFixed(2);
    } else {
      item.importe = (0).toFixed(2);
    }
    item.descuento = (0).toFixed(2);
    item.porcentaje_descuento = (0).toFixed(2);
    item.descripcion = '';
    item.importe_total = item.importe;
    item.anticipo = !comprobante.id;
    this.itemsOrdenPago.push(item);
  }

  quitarItem(item: ItemOrdenPago) {
    const index: number = this.itemsOrdenPago.indexOf(item);
    if (index !== -1) {
      this.itemsOrdenPago.splice(index, 1);
    }

    this.calcularImportes();
  }

  calcularImportes() {
    this.ordenPago.importe = 0;
    this.ordenPago.descuentos = 0;
    this.itemsOrdenPago.forEach( item => {
      this.ordenPago.importe = +this.ordenPago.importe + +item.importe_total;
      this.ordenPago.descuentos = +this.ordenPago.descuentos + +item.descuento;
    });
    this.ordenPago.importe_sub = +this.ordenPago.importe + +this.ordenPago.descuentos;
    this.ordenPago.importe_sub = this.ordenPago.importe_sub.toFixed(2);
    this.ordenPago.importe = this.ordenPago.importe.toFixed(2);
    this.ordenPago.descuentos = this.ordenPago.descuentos.toFixed(2);
  }

  calcularImportesItem(item: ItemOrdenPago) {
    item.importe_total = +item.importe - +item.descuento;
    item.importe_total = item.importe_total.toFixed(2);
    this.calcularImportes();
  }

  onImporteChanged(item: ItemOrdenPago, value) {
    item.importe = +value;
    item.importe = parseFloat(item.importe.toString());
    if (+item.importe > +item.comprobante.saldo) {
      item.importe = +item.comprobante.saldo;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[3].children[0].value = item.comprobante.saldo;
      }
    }
    if (+item.importe < 0) {
      item.importe = 0.00;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[3].children[0].value = '0.00';
      }
    }
    if (item.importe !== +value) {
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[3].children[0].value = item.importe;
      }
    }
    if (item.importe <= item.descuento) {
      item.descuento = item.importe;
    }
    item.porcentaje_descuento = (+item.descuento * 100 / +item.importe).toFixed(2);
    this.calcularImportesItem(item);
  }

  onDescuentoChanged(item: ItemOrdenPago, value) {
    item.descuento = +value;
    item.descuento = parseFloat(item.descuento.toString());
    if (+item.descuento > +item.importe) {
      item.descuento = +item.importe;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = item.importe;
      }
    }
    if (+item.descuento < 0) {
      item.descuento = 0.00;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = '0.00';
      }
    }
    if (item.descuento !== +value) {
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = item.descuento;
      }
    }
    item.porcentaje_descuento = (+item.descuento * 100 / +item.importe).toFixed(2);
    this.calcularImportesItem(item);
  }

  onPorcentajeDescuentoChanged(item: ItemOrdenPago, value) {
    item.porcentaje_descuento = +value;
    item.porcentaje_descuento = parseFloat(item.porcentaje_descuento.toString());
    if (+item.porcentaje_descuento > 100.00) {
      item.porcentaje_descuento = 100.00;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = 100.00;
      }
    }
    if (+item.porcentaje_descuento < 0) {
      item.porcentaje_descuento = 0.00;
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = '0.00';
      }
    }
    if (item.porcentaje_descuento !== +value) {
      const index = this.itemsOrdenPago.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = item.porcentaje_descuento;
      }
    }
    item.descuento = (+item.importe * +item.porcentaje_descuento / 100).toFixed(2);
    this.calcularImportesItem(item);
  }

  onDescripcionEnterPressed(item) {
    const index = this.itemsOrdenPago.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[3].children[0].select();
    }
  }

  onImporteEnterPressed(item) {
    const index = this.itemsOrdenPago.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[4].children[0].select();
    }
  }

  onPorcentajeDescuentoEnterPressed(item) {
    const index = this.itemsOrdenPago.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[5].children[0].select();
    }
  }

  onDescuentoEnterPressed(item) {
    // const index = this.itemsOrdenPago.indexOf(item);
    // if (index !== -1) {
    //   this.tabla.nativeElement.children[2].children[index].children[7].children[0].select();
    // }
  }

  canDeactivate() {
    if (this.modificado) {
      (<any>$('#modalPuedeSalir')).modal('show');
      return this.puedeSalir;
    } else {
      return true;
    }
  }

  continuar() {
    this.puedeSalir.next(true);
  }

  cancelar() {
    this.puedeSalir.next(false);
  }

  mostrarModalMediosPago() {
    (<any>$('#modalMediosPago')).modal('show');
    this.totalEfectivo = +this.ordenPago.importe;
    this.totalTarjetas = (0).toFixed(2);
    this.totalCheques = (0).toFixed(2);
    this.totalChequesTerceros = (0).toFixed(2);
    this.totalDepositos = (0).toFixed(2);
    this.tarjetas = [];
    this.depositos = [];
    this.cheques = [];
    this.chequesTerceros = [];
    this.calcularSaldo();
  }

  loadComponent(component) {
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = this.container.createComponent(factory);
  }

  abrirModalCheque() {
    // this.loadComponent(FastAbmChequeComponent);
    this.componentRef.instance.data.bancos = this.listaBancos;
    this.componentRef.instance.data.proveedor_id = this.proveedor.id;
    this.componentRef.instance.elements = this.cheques;
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEditCheques(event)));
    this.componentRef.instance.abrir();
  }

  abrirModalChequeTerceros() {
    this.loadComponent(SeleccionChequesComponent);
    this.componentRef.instance.bancos = this.listaBancos;
    this.componentRef.instance.clientes = this.listaClientes;
    this.componentRef.instance.cheques = this.listaCheques;
    this.subscriptions.add(this.componentRef.instance.chequesSeleccionados.subscribe( (event) => this.handleEditChequesTerceros(event)));
    this.componentRef.instance.abrir();
  }

  abrirModalTarjeta() {
    // this.loadComponent(FastAbmTarjetaComponent);
    this.componentRef.instance.data.tipos = this.listaTiposTarjeta;
    this.componentRef.instance.data.proveedor_id = this.proveedor.id;
    this.componentRef.instance.elements = this.tarjetas;
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEditTarjeta(event)));
    this.componentRef.instance.abrir();
  }

  abrirModalDeposito() {
    // this.loadComponent(FastAbmDepositoComponent);
    this.componentRef.instance.data.cuentas  = this.listaCuentas;
    this.componentRef.instance.data.proveedor_id = this.proveedor.id;
    this.componentRef.instance.elements = this.depositos;
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEditDeposito(event)));
    this.componentRef.instance.abrir();
  }

  cargarBancos() {
    this.subscriptions.add(this.apiService.get('bancos').subscribe(json => {
      this.listaBancos = json;
    }));
  }

  cargarClientes() {
    this.subscriptions.add(this.apiService.get('clientes').subscribe(json => {
      this.listaClientes = json;
    }));
  }

  cargarCheques() {
    this.subscriptions.add(this.apiService.get('chequesterceros/buscar', {estado: 'I'}).subscribe(json => {
      this.listaCheques = json;
    }));
  }

  cargarProveedores() {
    this.subscriptions.add(this.apiService.get('proveedores').subscribe(json => {
      this.allProveedores = json;
    }));
  }

  cargarTiposTarjeta() {
    this.subscriptions.add(this.apiService.get('tipostarjeta').subscribe(json => {
      this.listaTiposTarjeta = json;
    }));
  }

  cargarCuentas() {
    this.subscriptions.add(this.apiService.get('cuentasbancarias').subscribe(json => {
      this.listaCuentas = json;
    }));
  }

  calcularSaldo() {
    this.total = 0;
    this.total = +this.totalCheques + +this.totalTarjetas + +this.totalDepositos + +this.totalEfectivo + +this.totalChequesTerceros;
    this.redondeo = +this.ordenPago.importe - +this.total;
    this.total = this.total.toFixed(2);
    this.redondeo = this.redondeo.toFixed(2);
    this.totalDepositos = (+this.totalDepositos).toFixed(2);
    this.totalCheques = (+this.totalCheques).toFixed(2);
    this.totalChequesTerceros = (+this.totalChequesTerceros).toFixed(2);
    this.totalTarjetas = (+this.totalTarjetas).toFixed(2);
  }

  private handleEditTarjeta(tarjetas: Tarjeta[]) {
    this.tarjetas = tarjetas;
    this.totalEfectivo = (+this.totalEfectivo + +this.totalTarjetas).toFixed(2);
    this.totalTarjetas = 0;
    this.tarjetas.forEach(tarjeta => {
      this.totalTarjetas = +this.totalTarjetas + +tarjeta.importe;
    });
    this.totalEfectivo = (+this.totalEfectivo - +this.totalTarjetas).toFixed(2);
    if (+this.totalEfectivo < this.marginRedondeo) {
      this.totalEfectivo = (0).toFixed(2);
    }
    this.calcularSaldo();
  }

  private handleEditDeposito(depositos: Deposito[]) {
    this.depositos = depositos;
    this.totalEfectivo = (+this.totalEfectivo + +this.totalDepositos).toFixed(2);
    this.totalDepositos = 0;
    this.depositos.forEach(deposito => {
      this.totalDepositos = +this.totalDepositos + +deposito.importe;
    });
    this.totalEfectivo = (+this.totalEfectivo - +this.totalDepositos).toFixed(2);
    if (+this.totalEfectivo < this.marginRedondeo) {
      this.totalEfectivo = (0).toFixed(2);
    }
    this.calcularSaldo();
  }

  protected handleEditCheques(cheques: Cheque[]) {
    this.cheques = cheques;
    this.totalEfectivo = (+this.totalEfectivo + +this.totalCheques).toFixed(2);
    this.totalCheques = 0;
    this.cheques.forEach(cheque => {
      this.totalCheques = +this.totalCheques + +cheque.importe;
    });
    this.totalEfectivo = (+this.totalEfectivo - +this.totalCheques).toFixed(2);
    if (+this.totalEfectivo < this.marginRedondeo) {
      this.totalEfectivo = (0).toFixed(2);
    }
    this.calcularSaldo();
  }

  handleEditChequesTerceros(chequesTerceros: Cheque[]) {
    this.chequesTerceros = chequesTerceros;
    this.totalEfectivo = (+this.totalEfectivo + +this.totalChequesTerceros).toFixed(2);
    this.totalChequesTerceros = 0;
    this.chequesTerceros.forEach(cheque => {
      this.totalChequesTerceros = +this.totalChequesTerceros + +cheque.importe;
    });
    this.totalEfectivo = (+this.totalEfectivo - +this.totalChequesTerceros).toFixed(2);
    if (+this.totalEfectivo < this.marginRedondeo) {
      this.totalEfectivo = (0).toFixed(2);
    }
    this.calcularSaldo();
  }

  generarOrdenPago() {
    this.ordenPago.proveedor_id = this.proveedor.id;
    this.ordenPago.items = this.itemsOrdenPago;

    const ordenPago_valores = [];
    this.mediosPago.forEach( medioPago => {
      switch (medioPago.nombre) {
        case 'Efectivo':
          if (+this.totalEfectivo !== 0) {
            ordenPago_valores.push({
              importe: this.totalEfectivo,
              medios_pago_id: medioPago.id
            });
          }
          break;

        case 'Cheque':
          if (+this.totalChequesTerceros !== 0) {
            ordenPago_valores.push({
              importe: this.totalChequesTerceros,
              medios_pago_id: medioPago.id,
              cheques_terceros: this.chequesTerceros
            });
          }
          break;

        case 'Tarjeta':
          if (+this.totalTarjetas !== 0) {
            ordenPago_valores.push({
              importe: this.totalTarjetas,
              medios_pago_id: medioPago.id,
              tarjetas: this.tarjetas
            });
          }
          break;

        case 'Depósito':
          if (+this.totalDepositos !== 0) {
            ordenPago_valores.push({
              importe: this.totalDepositos,
              medios_pago_id: medioPago.id,
              depositos: this.depositos
            });
          }
          break;

        case 'Redondeo':
          if (+this.redondeo !== 0) {
            ordenPago_valores.push({
              importe: this.redondeo,
              medios_pago_id: medioPago.id,
            });
          }
          break;
      }
    });

    this.ordenPago.orden_pago_valores = ordenPago_valores;
    this.ordenPago.fecha = HelperService.myDatePickerDateToString(this.fecha);

    this.subscriptions.add(this.apiService.post('ordenespago', this.ordenPago).subscribe( json => {
      this.alertService.success('Se ha generado la orden de pago con éxito');
      this.proveedor = null;
      this.inicializar();
    }, error => {
      this.alertService.error('No se ha podido generar la orden de pago');
    }));
  }

  private cargarMediosPago() {
    this.subscriptions.add(this.apiService.get('mediospago').subscribe( json => {
      this.mediosPago = json;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
