import {AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Cliente} from '../../shared/domain/cliente';
import {IMyDate, IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../shared/services/api.service';
import {AlertService} from '../../shared/services/alert.service';
import {Observable} from 'rxjs/Observable';
import {ItemCobro} from '../../shared/domain/itemCobro';
import {Cobro} from '../../shared/domain/cobro';
import {TipoComprobante} from '../../shared/domain/tipocomprobante';
import {isNullOrUndefined} from 'util';
import {Comprobante} from '../../shared/domain/comprobante';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {HelperService} from '../../shared/services/helper.service';
import {Subject} from 'rxjs/Subject';
import {Banco} from '../../shared/domain/banco';
import {Cheque} from '../../shared/domain/cheque';
import {TipoTarjeta} from '../../shared/domain/tipoTarjeta';
import {CuentaBancaria} from '../../shared/domain/cuentaBancaria';
import {Tarjeta} from '../../shared/domain/tarjeta';
import {Deposito} from '../../shared/domain/deposito';
import {FastAbmChequeComponent} from 'app/ventas/fast-abm-cheque/fast-abm-cheque.component';
import {FastAbmDepositoComponent} from '../fast-abm-deposito/fast-abm-deposito.component';
import {FastAbmTarjetaComponent} from '../fast-abm-tarjeta/fast-abm-tarjeta.component';
import {MedioPago} from 'app/shared/domain/medioPago';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-cobros',
  templateUrl: './cobros.component.html',
  styleUrls: ['./cobros.component.css']
})
export class CobrosComponent implements OnInit, AfterViewInit, OnDestroy {
  marginRedondeo = 10;
  depositos: Deposito[] = [];
  listaTiposTarjeta: TipoTarjeta[] = [];
  total: string | number = 0;
  cheques: Cheque[] = [];
  cobro: Cobro;
  itemsCobro: ItemCobro[] = [];
  cliente: Cliente;
  clienteAsync: string;
  listaClientes: Cliente[];
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  dtOptions: any = {};
  busquedaCliente: string;
  busquedaClienteSeleccionado: Cliente;
  busquedaClientes: Cliente[];
  @ViewChild('typeaheadNombreCliente')
  private typeaheadNombreClienteElement: ElementRef;
  @ViewChild('tabla')
  private tabla: ElementRef;
  @ViewChild('modalContainer', { read: ViewContainerRef }) container;
  typeaheadNombreClienteNoResults: boolean;
  typeaheadCodigoClienteNoResults: boolean;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  tipoComprobante: TipoComprobante;
  comprobantesAMostrar: Comprobante[];
  comprobantes: Comprobante[];
  modificado = false;
  puedeSalir: Subject<Boolean> = new Subject;
  listaBancos: Banco[] = [];
  allClientes: Cliente[] = [];
  redondeo: string | number = 0;
  listaCuentas: CuentaBancaria[] = [];
  tarjetas: Tarjeta[] = [];
  totalCheques: string | number = 0;
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
    this.clientes = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        this.listaClientes = json;
        observer.next(json);
      }));
    });

    this.clientesCod = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('clientes/codigo/' + this.clienteCodAsync).subscribe(json => {
        if (json === '') {
          this.listaClientes = [];
          observer.next([]);
        } else {
          this.listaClientes = [json];
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
    this.typeaheadNombreClienteElement.nativeElement.focus();
  }

  inicializar() {
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.clienteAsync = '';
    this.clienteCodAsync = '';
    this.itemsCobro = [];
    this.cliente = new Cliente;
    this.cobro = new Cobro;
    this.cobro.importe = 0;
    this.cobro.punto_venta = '0001';
    this.totalCheques = 0;
    this.totalTarjetas = 0;
    this.totalDepositos = 0;
    this.totalEfectivo = 0;
    this.tarjetas = [];
    this.cheques = [];
    this.depositos = [];
    this.submitted = false;
    this.modificado = false;
    this.navbarTitleService.setTitle('Cobro');
    this.cargarBancos();
    this.cargarClientes();
    this.cargarCuentas();
    this.cargarTiposTarjeta();
    this.cargarMediosPago();
  }

  onClienteChanged(event) {
    this.modificado = true;
    this.typeaheadNombreClienteNoResults = false;
    this.typeaheadCodigoClienteNoResults = false;
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.subscriptions.add(this.apiService.get('cobros/comprobantes', {'cliente': this.cliente.id}).subscribe( json => {
      this.comprobantes = json;
      this.comprobantes.forEach(reg => {
        reg.ptoventaynumero = ('000' + reg.punto_venta).slice(-4) + '-' + ('0000000' + reg.numero).slice(-8);
      });

      this.itemsCobro = [];
      this.mostrarModalComprobantes();
    }));
    this.subscriptions.add(this.apiService.get('tipocomprobantes/' + 'recibo' + '/' + this.cliente.tipo_responsable).subscribe( json => {
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

      this.subscriptions.add(this.apiService.get('contadores/' + this.cobro.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        if (contador === '') {
          this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.cobro.punto_venta, false);
        } else {
          this.cobro.numero = +contador.ultimo_generado + 1;
          this.cobro.numero = ('0000000' + this.cobro.numero).slice(-8);

          // // Se selecciona el input de código de artículo
          // setTimeout(() => {
          //   this.tabla.nativeElement.children[1].children[this.items.length - 1].children[0].children[0].children[0].children[0].focus();
          // } , 100);
        }
      }));
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

  changeTypeaheadNombreClienteNoResults(e: boolean): void {
    this.typeaheadNombreClienteNoResults = e;
  }

  changeTypeaheadCodigoClienteNoResults(e: boolean): void {
    this.typeaheadCodigoClienteNoResults = e;
  }

  typeaheadNombreClienteOnBlur() {
    if (!isNullOrUndefined(this.clienteAsync)
      && this.clienteAsync.length > 0
      && this.clienteAsync !== this.cliente.nombre
      && !this.typeaheadNombreClienteNoResults) {
      this.cliente = this.listaClientes[0];
      this.onClienteChanged(this.cliente);
    }
  }

  typeaheadCodClienteOnBlur() {
    if (!isNullOrUndefined(this.clienteCodAsync)
      && this.clienteCodAsync.length > 0
      && this.clienteCodAsync !== this.cliente.codigo
      && !this.typeaheadCodigoClienteNoResults) {
      this.cliente = this.listaClientes[0];
      this.onClienteChanged(this.cliente);
    }
  }

  buscarClientes() {
    this.busquedaClienteSeleccionado = null;
    this.subscriptions.add(this.apiService.get('clientes/buscar/' + this.busquedaCliente).subscribe( json => {
      this.busquedaClientes = json;
    }));
  }

  confirmarBusquedaCliente () {
    this.clienteAsync = this.busquedaClienteSeleccionado.nombre;
    this.clienteCodAsync = this.busquedaClienteSeleccionado.codigo;
    this.onClienteChanged(this.busquedaClienteSeleccionado);
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  private mostrarModalComprobantes() {
    this.comprobantesAMostrar = this.comprobantes.filter(reg => {
      return !this.itemsCobro.find(item => item.comprobante.id === reg.id);
    });
    const anticipo = new Comprobante();
    anticipo.saldo = 999999999;
    anticipo.importe_total = 0.00;
    anticipo.tipo_comprobante = new TipoComprobante();
    anticipo.tipo_comprobante.nombre = 'Anticipo';
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

  agregarItem(comprobante: Comprobante) {
    const item = new ItemCobro();
    item.comprobante = comprobante;
    if (comprobante.tipo_comprobante.nombre !== 'Anticipo') {
      item.comprobante_id = comprobante.id;
      item.importe = (+comprobante.saldo).toFixed(2);
    } else {
      item.importe = (0).toFixed(2);
    }
    item.descuento = (0).toFixed(2);
    item.porcentaje_descuento = (0).toFixed(2);
    item.descripcion = '';
    item.importe_total = item.importe;
    item.anticipo = !comprobante.id;
    this.itemsCobro.push(item);
  }

  quitarItem(item: ItemCobro) {
    const index: number = this.itemsCobro.indexOf(item);
    if (index !== -1) {
      this.itemsCobro.splice(index, 1);
    }

    this.calcularImportes();
  }

  calcularImportes() {
    this.cobro.importe = 0;
    this.cobro.descuentos = 0;
    this.itemsCobro.forEach( item => {
      this.cobro.importe = +this.cobro.importe + +item.importe_total;
      this.cobro.descuentos = +this.cobro.descuentos + +item.descuento;
    });
    this.cobro.importe_sub = +this.cobro.importe + +this.cobro.descuentos;
    this.cobro.importe_sub = this.cobro.importe_sub.toFixed(2);
    this.cobro.importe = this.cobro.importe.toFixed(2);
    this.cobro.descuentos = this.cobro.descuentos.toFixed(2);
  }

  calcularImportesItem(item: ItemCobro) {
    item.importe_total = +item.importe - +item.descuento;
    item.importe_total = item.importe_total.toFixed(2);
    this.calcularImportes();
  }

  onImporteChanged(item: ItemCobro, value) {
    item.importe = +value;
    item.importe = parseFloat(item.importe.toString());
    if (+item.importe > +item.comprobante.saldo) {
      item.importe = +item.comprobante.saldo;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[3].children[0].value = item.comprobante.saldo;
      }
    }
    if (+item.importe < 0) {
      item.importe = 0.00;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[3].children[0].value = '0.00';
      }
    }
    if (item.importe !== +value) {
      const index = this.itemsCobro.indexOf(item);
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

  onDescuentoChanged(item: ItemCobro, value) {
    item.descuento = +value;
    item.descuento = parseFloat(item.descuento.toString());
    if (+item.descuento > +item.importe) {
      item.descuento = +item.importe;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = item.importe;
      }
    }
    if (+item.descuento < 0) {
      item.descuento = 0.00;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = '0.00';
      }
    }
    if (item.descuento !== +value) {
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[5].children[0].value = item.descuento;
      }
    }
    item.porcentaje_descuento = (+item.descuento * 100 / +item.importe).toFixed(2);
    this.calcularImportesItem(item);
  }

  onPorcentajeDescuentoChanged(item: ItemCobro, value) {
    item.porcentaje_descuento = +value;
    item.porcentaje_descuento = parseFloat(item.porcentaje_descuento.toString());
    if (+item.porcentaje_descuento > 100.00) {
      item.porcentaje_descuento = 100.00;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = 100.00;
      }
    }
    if (+item.porcentaje_descuento < 0) {
      item.porcentaje_descuento = 0.00;
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = '0.00';
      }
    }
    if (item.porcentaje_descuento !== +value) {
      const index = this.itemsCobro.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[2].children[index].children[4].children[0].value = item.porcentaje_descuento;
      }
    }
    item.descuento = (+item.importe * +item.porcentaje_descuento / 100).toFixed(2);
    this.calcularImportesItem(item);
  }

  onDescripcionEnterPressed(item) {
    const index = this.itemsCobro.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[3].children[0].select();
    }
  }

  onImporteEnterPressed(item) {
    const index = this.itemsCobro.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[4].children[0].select();
    }
  }

  onPorcentajeDescuentoEnterPressed(item) {
    const index = this.itemsCobro.indexOf(item);
    if (index !== -1) {
      this.tabla.nativeElement.children[2].children[index].children[5].children[0].select();
    }
  }

  onDescuentoEnterPressed(item) {
    // const index = this.itemsCobro.indexOf(item);
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
    this.totalEfectivo = +this.cobro.importe;
    this.totalTarjetas = (0).toFixed(2);
    this.totalCheques = (0).toFixed(2);
    this.totalDepositos = (0).toFixed(2);
    this.tarjetas = [];
    this.depositos = [];
    this.cheques = [];
    this.calcularSaldo();
  }

  loadComponent(component) {
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = this.container.createComponent(factory);
  }

  abrirModalCheque() {
    this.loadComponent(FastAbmChequeComponent);
    this.componentRef.instance.data.bancos = this.listaBancos;
    this.componentRef.instance.data.cliente_id = this.cliente.id;
    this.componentRef.instance.elements = this.cheques;
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEditCheques(event)));
    this.componentRef.instance.abrir();
  }

  abrirModalTarjeta() {
    this.loadComponent(FastAbmTarjetaComponent);
    this.componentRef.instance.data.tipos = this.listaTiposTarjeta;
    this.componentRef.instance.data.cliente_id = this.cliente.id;
    this.componentRef.instance.elements = this.tarjetas;
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEditTarjeta(event)));
    this.componentRef.instance.abrir();
  }

  abrirModalDeposito() {
    this.loadComponent(FastAbmDepositoComponent);
    this.componentRef.instance.data.cuentas  = this.listaCuentas;
    this.componentRef.instance.data.cliente_id = this.cliente.id;
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
      this.allClientes = json;
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
    this.total = +this.totalCheques + +this.totalTarjetas + +this.totalDepositos + +this.totalEfectivo;
    this.redondeo = +this.cobro.importe - +this.total;
    this.total = this.total.toFixed(2);
    this.redondeo = this.redondeo.toFixed(2);
    this.totalDepositos = (+this.totalDepositos).toFixed(2);
    this.totalCheques = (+this.totalCheques).toFixed(2);
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

  generarCobro() {
    this.cobro.cliente_id = this.cliente.id;
    this.cobro.items = this.itemsCobro;

    const cobro_valores = [];
    this.mediosPago.forEach( medioPago => {
      switch (medioPago.nombre) {
        case 'Efectivo':
          if (+this.totalEfectivo !== 0) {
            cobro_valores.push({
              importe: this.totalEfectivo,
              medios_pago_id: medioPago.id
            });
          }
          break;

        case 'Cheque':
          if (+this.totalCheques !== 0) {
            cobro_valores.push({
              importe: this.totalCheques,
              medios_pago_id: medioPago.id,
              cheques: this.cheques
            });
          }
          break;

        case 'Tarjeta':
          if (+this.totalTarjetas !== 0) {
            cobro_valores.push({
              importe: this.totalTarjetas,
              medios_pago_id: medioPago.id,
              tarjetas: this.tarjetas
            });
          }
          break;

        case 'Depósito':
          if (+this.totalDepositos !== 0) {
            cobro_valores.push({
              importe: this.totalDepositos,
              medios_pago_id: medioPago.id,
              depositos: this.depositos
            });
          }
          break;

        case 'Redondeo':
          if (+this.redondeo !== 0) {
            cobro_valores.push({
              importe: this.redondeo,
              medios_pago_id: medioPago.id,
            });
          }
          break;
      }
    });

    this.cobro.cobro_valores = cobro_valores;
    this.cobro.fecha = HelperService.myDatePickerDateToString(this.fecha);

    this.subscriptions.add(this.apiService.post('cobros', this.cobro).subscribe( json => {
      this.alertService.success('Se ha generado el cobro con éxito');
      this.cliente = null;
      this.inicializar();
    }, error => {
      this.alertService.error('No se ha podido generar el cobro');
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
