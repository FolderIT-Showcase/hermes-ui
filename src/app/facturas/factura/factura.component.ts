import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Cliente } from 'domain/cliente';
import { TipoComprobante } from 'domain/tipocomprobante';
import { Comprobante } from 'domain/comprobante';
import { Item } from 'domain/item';
import { Articulo } from 'domain/articulo';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../../service/api.service';
import { AlertService } from '../../../service/alert.service';
import {Marca} from '../../../domain/marca';
import {Rubro} from '../../../domain/rubro';
import {Subrubro} from '../../../domain/subrubro';
import {ListaPrecios} from '../../../domain/listaPrecios';
import {Parametro} from '../../../domain/parametro';
import {AuthenticationService} from '../../../service/authentication.service';
import {isNullOrUndefined} from 'util';
import {Router} from '@angular/router';
import {IMyDate, IMyDpOptions} from 'mydatepicker';
import {TooltipConfig} from 'ngx-bootstrap/tooltip';

export function getAlertConfig(): TooltipConfig {
  return Object.assign(new TooltipConfig(), {placement: 'left', container: 'body'});
}

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css'],
  providers: [{provide: TooltipConfig, useFactory: getAlertConfig}]
})
export class FacturaComponent implements OnInit, AfterViewInit {
  items: Item[] = [];
  @Input() tipoFactura: string;
  @Input() cliente: Cliente;
  @Input() nuevoOEditar = 'nuevo';
  @Input() @Output() factura: Comprobante = new Comprobante;
  @Input() routeAfter: string;
  @Output() change = new EventEmitter<Boolean>();
  itemsABorrar: Item[] = [];
  clienteAsync: string;
  listaClientes: Cliente[];
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  articulos: Articulo[];
  tipoComprobante: TipoComprobante = new TipoComprobante;
  dtOptions: any = {};
  busquedaCliente: string;
  busquedaClienteSeleccionado: Cliente;
  busquedaClientes: Cliente[];
  busquedaArticulo: string;
  busquedaArticuloSeleccionado: Articulo;
  busquedaArticulos: Articulo[];
  marcas: Marca[];
  rubros: Rubro[];
  subrubros: Subrubro[];
  subrubrosAMostrar: Subrubro[];
  busquedaArticuloRubroId: number;
  busquedaArticuloSubrubroId: number;
  busquedaArticuloMarcaId: number;
  listasPrecios: ListaPrecios[] = [];
  parametroModificaPrecio: Parametro;
  parametroUsaDescuento: Parametro;
  parametroDescuentoMax: Parametro;
  listaPreciosSeleccionada: ListaPrecios;
  listaAnterior: ListaPrecios;
  iva = 0.21;
  itemEnBusqueda: Item;
  @ViewChild('typeaheadNombreCliente')
  private typeaheadNombreClienteElement: ElementRef;
  @ViewChild('tabla')
  private tabla: ElementRef;
  typeaheadNombreClienteNoResults: boolean;
  typeaheadCodigoClienteNoResults: boolean;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {
    this.clientes = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        this.listaClientes = json;
        observer.next(json);
      });
    });

    this.clientesCod = Observable.create((observer: any) => {
      this.apiService.get('clientes/codigo/' + this.clienteCodAsync).subscribe(json => {
        if (json === '') {
          this.listaClientes = [];
          observer.next([]);
        } else {
          this.listaClientes = [json];
          observer.next([json]);
        }
      });
    });
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
      scrollY: '250px',
      paging: false,
      columnDefs: [ {
        'targets': 0,
        'searchable': false,
        'orderable': true,
        'width': '10%'
      }, {
        'targets': 1,
        'searchable': false,
        'orderable': false,
        'width': '25%'
      }, {
        'targets': 2,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 3,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 4,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '15%'
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

    this.inicializar();
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreClienteElement.nativeElement.focus();
  }

  inicializar() {
    this.change.emit(false);
    // Si el cliente es nulo es una nueva factura y se inicializan los valores
    if (isNullOrUndefined(this.cliente)) {
      const today = new Date();
      this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
      this.clienteAsync = '';
      this.clienteCodAsync = '';
      this.items = [];
      this.cliente = new Cliente;
      this.factura = new Comprobante;
      this.factura.importe_total = 0;
      this.factura.punto_venta = '0001';
      this.factura.anulado = false;
    } else {
      Object.assign(this.items, this.factura.items);
      this.clienteCodAsync = this.cliente.codigo;
      this.clienteAsync = this.cliente.nombre;
      let month = this.factura.fecha.toString().slice(5, 7);
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      let day = this.factura.fecha.toString().slice(8, 10);
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.fecha =  {
        date: {
          year: this.factura.fecha.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
      this.apiService.get('tipocomprobantes/' + this.tipoFactura + '/' + this.cliente.tipo_responsable).subscribe( json => {
        this.tipoComprobante = json;
      });
      this.items.push(new Item);
    }

    this.cargarListasPrecios();
    this.obtenerParametros();
  }

  onClienteChanged(event) {
    this.change.emit(true);
    this.typeaheadNombreClienteNoResults = false;
    this.typeaheadCodigoClienteNoResults = false;
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.apiService.get('tipocomprobantes/' + this.tipoFactura + '/' + this.cliente.tipo_responsable).subscribe( json => {
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

      this.apiService.get('contadores/' + this.factura.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        if (contador === '') {
          this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.factura.punto_venta, false);
        } else {
          this.factura.numero = +contador.ultimo_generado + 1;
          this.factura.numero = ('0000000' + this.factura.numero).slice(-8);

          this.onListaPreciosChanged();
          this.items.forEach( item => {
            this.calcularImporteUnitario(item);
            this.calcularImportesItem(item);
          });
          this.calcularImportesFactura();
          if (this.items.length === 0) {
            this.items.push(new Item);
          }
          // Se selecciona el input de código de artículo
          setTimeout(() => {
            this.tabla.nativeElement.children[1].children[this.items.length - 1].children[0].children[0].children[0].children[0].focus();
          } , 100);
        }
      });
    });
  }

  onArticuloChanged(articulo: Articulo, item: Item) {
    item.codigo = articulo.codigo;
    item.nombre = articulo.nombre;
    item.articulo_id = articulo.id;
    item.costo_unitario = +articulo.costo;
    if (!isNullOrUndefined(this.listaPreciosSeleccionada)) {
      this.calcularImporteUnitario(item);
      this.calcularImportesItem(item);
    }
    const index = this.items.indexOf(item);
    if (index !== -1) {
      // Se selecciona el input de cantidad
      this.tabla.nativeElement.children[1].children[index].children[2].children[0].select();
    }
  }

  onCantidadChanged(item: Item, value) {
    item.cantidad = +value;
    item.cantidad = parseInt(item.cantidad.toString(10), 10);
    if (+item.cantidad > 99999) {
      item.cantidad = 99999;
      const index = this.items.indexOf(item);
      if (index !== -1) {
        // Necesario para mantener sincronizado lo que se muestra en el input con el valor de la cantidad, si no,
        // el input acepta cualquier número y la cantidad se mantiene en 99999
        this.tabla.nativeElement.children[1].children[index].children[2].children[0].value = '99999';
      }
    } else

    if (+item.cantidad <= 0) {
      item.cantidad = 1;
      const index = this.items.indexOf(item);
      if (index !== -1) {
        // Necesario para mantener sincronizado lo que se muestra en el input con el valor de la cantidad, si no,
        // el input acepta cualquier número y la cantidad se mantiene en 1
        this.tabla.nativeElement.children[1].children[index].children[2].children[0].value = '1';
      }
    } else

    // Si el input tiene un valor no entero, se fuerza a que lo sea
    if (item.cantidad !== +value) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[1].children[index].children[2].children[0].value = item.cantidad;
      }
    }
    this.calcularImportesItem(item);
  }

  onImporteUnitarioChanged(item: Item) {
    this.calcularImportesItem(item);
  }

  onPorcentajeDescuentoChanged(item: Item, value) {
    item.porcentaje_descuento = +value;
    item.porcentaje_descuento = parseFloat(item.porcentaje_descuento.toString());
    if (+item.porcentaje_descuento > +this.parametroDescuentoMax.valor) {
      item.porcentaje_descuento = +this.parametroDescuentoMax.valor;
      const index = this.items.indexOf(item);
      if (index !== -1) {
        // Necesario para mantener sincronizado lo que se muestra en el input con el valor de la porcentaje, si no,
        // el input acepta cualquier número y el porcentaje se mantiene en el máximo
        this.tabla.nativeElement.children[1].children[index].children[4].children[0].value = this.parametroDescuentoMax.valor;
      }
    }

    if (+item.porcentaje_descuento < 0) {
      item.porcentaje_descuento = 0.00;
      const index = this.items.indexOf(item);
      if (index !== -1) {
        // Necesario para mantener sincronizado lo que se muestra en el input con el valor de la porcentaje, si no,
        // el input acepta cualquier número y el porcentaje se mantiene en 0
        this.tabla.nativeElement.children[1].children[index].children[4].children[0].value = '0.00';
      }
    }

    if (item.porcentaje_descuento !== +value) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[1].children[index].children[4].children[0].value = item.porcentaje_descuento;
      }
    }
    this.calcularImportesItem(item);
  }

  calcularImportesItem(item: Item) {
    item.importe_descuento = (+item.cantidad * +item.importe_unitario * (+item.porcentaje_descuento / 100)).toFixed(2);
    item.importe_total = (+item.cantidad * +item.importe_unitario - +item.importe_descuento).toFixed(2);
    if (item.articulo_id && item.cantidad && +item.importe_unitario) {
      this.calcularImportesFactura();
    }
  }

  agregarNuevo(item: Item) {
    this.change.emit(true);
    if (item.articulo_id && item.cantidad && +item.importe_unitario) {
      this.items.push(new Item);
      this.calcularImportesFactura();
      // Se selecciona el input del código del nuevo item agregado
      setTimeout(() => {
        this.tabla.nativeElement.children[1].children[this.items.length - 1].children[0].children[0].children[0].children[0].focus();
      } , 100);
    }
  }

  quitarItem(item: Item) {
    const index: number = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    this.calcularImportesFactura();
    if (this.items.length === 0) {
      this.items.push(new Item);
    }
  }

  generarFactura() {
    this.factura.cliente_id = this.cliente.id;
    this.factura.cliente_cuit = this.cliente.cuit;
    this.factura.cliente_nombre = this.cliente.nombre;
    this.factura.cliente_tipo_resp = this.cliente.tipo_responsable;
    this.factura.tipo_comprobante_id = this.tipoComprobante.id;
    this.factura.alicuota_iva = this.iva;
    this.factura.saldo = 0;
    this.factura.lista_id = this.cliente.lista_id;
    this.factura.items = this.items.filter(item => item.articulo_id && item.cantidad && +item.importe_unitario);

    this.factura.fecha =  this.fecha.date.year + '-' + this.fecha.date.month + '-' + this.fecha.date.day;

    if (this.nuevoOEditar === 'nuevo') {
      this.apiService.post('comprobantes', this.factura).subscribe( (json) => {
        if (json.hasOwnProperty('error')) {
          this.alertService.error(json['error']);
        } else {
          this.change.emit(false);
          this.alertService.success('El comprobante se ha generado con éxito');
          if (!isNullOrUndefined(this.routeAfter)) {
            this.router.navigate([this.routeAfter]).catch();
          } else {
            this.cliente = null;
            this.inicializar();
            this.typeaheadNombreClienteElement.nativeElement.focus();
          }
        }
      });
    } else {
      this.change.emit(false);
      this.apiService.put('comprobantes/' + this.factura.id, this.factura).subscribe( () => {
        this.alertService.success('El comprobante se ha modificado con éxito', true);
        if (!isNullOrUndefined(this.routeAfter)) {
          this.router.navigate([this.routeAfter]).catch();
        }
      });
    }
  }

  buscarClientes() {
    this.busquedaClienteSeleccionado = null;
    this.apiService.get('clientes/buscar/' + this.busquedaCliente).subscribe( json => {
      this.busquedaClientes = json;
    });
  }

  confirmarBusquedaCliente () {
    this.clienteAsync = this.busquedaClienteSeleccionado.nombre;
    this.clienteCodAsync = this.busquedaClienteSeleccionado.codigo;
    this.onClienteChanged(this.busquedaClienteSeleccionado);
  }

  mostrarModalBuscarArticulos(item: Item) {
    this.cargarMarcas();
    this.cargarRubros();
    this.cargarSubrubros();
    this.busquedaArticuloMarcaId = null;
    this.busquedaArticuloRubroId = null;
    this.busquedaArticuloSubrubroId = null;
    this.itemEnBusqueda = item;
  }

  cargarMarcas() {
    this.apiService.get('marcas').subscribe( json => {
      this.marcas = json;
    });
  }

  cargarRubros() {
    this.apiService.get('rubros').subscribe( json => {
      this.rubros = json;
    });
  }

  cargarSubrubros() {
    this.apiService.get('subrubros').subscribe( json => {
      this.subrubros = json;
      this.subrubrosAMostrar = json;
    });
  }

  filterSubrubros() {
    if (this.busquedaArticuloRubroId !== 0) {
      this.subrubrosAMostrar = this.subrubros.filter(x => x.rubro_id === this.busquedaArticuloRubroId);
    } else {
      this.subrubrosAMostrar = this.subrubros;
    }
  }

  buscarArticulos() {
    if (this.busquedaArticuloMarcaId === null) {
      this.busquedaArticuloMarcaId = 0;
    }
    if (this.busquedaArticuloRubroId === null) {
      this.busquedaArticuloRubroId = 0;
    }
    if (this.busquedaArticuloSubrubroId === null) {
      this.busquedaArticuloSubrubroId = 0;
    }
    this.apiService.get('articulos/buscar', {
        'marca': this.busquedaArticuloMarcaId,
        'rubro': this.busquedaArticuloRubroId,
        'subrubro': this.busquedaArticuloSubrubroId,
        'busqueda': this.busquedaArticulo
      }
    ).subscribe( json => {
      json.forEach( art => {
        art.marca_nombre = this.marcas.find(x => x.id === art.marca_id).nombre;
        art.rubro_nombre = this.rubros.find(x => x.id === art.subrubro.rubro_id).nombre;
        art.subrubro_nombre = this.subrubros.find(x => x.id === art.subrubro_id).nombre;
      });
      this.busquedaArticulos = json;
    });
  }

  confirmarBusquedaArticulo() {
    this.onArticuloChanged(this.busquedaArticuloSeleccionado, this.itemEnBusqueda);
  }

  private cargarListasPrecios() {
    this.apiService.get('listaprecios').subscribe(json => {
      this.listasPrecios = json;
      if (!isNullOrUndefined(this.cliente) && ! isNullOrUndefined(this.cliente.lista_id)) {
        this.listaPreciosSeleccionada = this.listasPrecios.find(x => x.id === this.cliente.lista_id);
        this.listaAnterior = this.listaPreciosSeleccionada;
      }
    });
  }

  private obtenerParametros() {
    const parametros = this.authenticationService.getCurrentParameters();
    this.parametroModificaPrecio = parametros.find(x => x.nombre === 'VTA_MODIFICA_PRECIO');
    this.parametroUsaDescuento = parametros.find(x => x.nombre === 'VTA_USA_DESCUENTO');
    this.parametroDescuentoMax = parametros.find(x => x.nombre === 'VTA_DESCUENTO_MAX');
  }

  onListaPreciosChanged() {
    this.listaPreciosSeleccionada = this.listasPrecios.find(x => x.id === this.cliente.lista_id);
    if (this.items.length > 0 && this.listaPreciosSeleccionada !== this.listaAnterior) {
      if (this.items.length > 1) {
        $('#modalCambiarListaPrecios').modal('show');
      } else if (this.items.length === 1 && this.items[0].articulo_id) {
        $('#modalCambiarListaPrecios').modal('show');
      } else {
        this.listaAnterior = this.listaPreciosSeleccionada;
      }
    } else {
      this.listaAnterior = this.listaPreciosSeleccionada;
    }
  }

  cancelarCambioListaPrecios() {
    this.listaPreciosSeleccionada = this.listaAnterior;
    this.cliente.lista_id = this.listaPreciosSeleccionada.id;
  }

  confirmarCambioListaPrecios() {
    this.itemsABorrar = this.items.filter( item => {
      if (!item.articulo_id) {
        return false;
      }
      if (isNullOrUndefined(this.listaPreciosSeleccionada)) {
        return true;
      }
      return !this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === item.articulo_id);
    });
    if (this.itemsABorrar.length > 0) {
      $('#modalEliminarItems').modal('show');
    } else {
      this.cambiarListaPrecios();
    }
  }

  cambiarListaPrecios() {
    this.change.emit(true);
    this.listaAnterior = this.listaPreciosSeleccionada;
    this.items = this.items.filter( item => {
      if (!item.articulo_id) {
        return true;
      }
      if (isNullOrUndefined(this.listaPreciosSeleccionada)) {
        return false;
      }
      return this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === item.articulo_id);
    });
    this.items.forEach( item => {
      if (!!item.articulo_id) {
        this.calcularImporteUnitario(item);
        this.calcularImportesItem(item);
      }

    });
    this.calcularImportesFactura();
    if (this.items.length === 0) {
      this.items.push(new Item);
    }
  }

  private calcularImportesFactura() {
    this.change.emit(true);
    this.factura.importe_neto = 0;
    this.items.filter(item => item.articulo_id && item.cantidad && +item.importe_unitario)
      .forEach( item => {
        this.factura.importe_neto = +this.factura.importe_neto + +item.importe_total;
      });
    this.factura.importe_neto = this.factura.importe_neto.toFixed(2);
    switch (this.cliente.tipo_responsable) {
      case 'RI':
        this.factura.importe_iva = (+this.factura.importe_neto * this.iva).toFixed(2);
        this.factura.importe_total = (+this.factura.importe_neto + +this.factura.importe_iva).toFixed(2);
        break;
      case 'CF': case 'MON': default:
      this.factura.importe_total = this.factura.importe_neto;
      break;
    }
  }

  private calcularImporteUnitario(item: Item) {
    let itemLista;
    if (!isNullOrUndefined(this.listaPreciosSeleccionada)) {
      itemLista = this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === item.articulo_id);
    }
    if (!isNullOrUndefined(itemLista)) {
      switch (this.cliente.tipo_responsable) {
        case 'RI':
          item.importe_unitario = (+itemLista.precio_venta).toFixed(2);
          break;
        case 'CF': case 'MON': default:
        item.importe_unitario = (itemLista.precio_venta * (1 + this.iva)).toFixed(2);
        break;
      }
    } else {
      item.importe_unitario = 0;
    }
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

  cancelar() {
    this.change.emit(false);
    this.router.navigate([this.routeAfter]).catch();
  }

  private fechaMayor(primerFecha: IMyDate, segundaFecha: any): boolean {
    return (primerFecha.year > segundaFecha.date.year)
      ||  ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month > segundaFecha.date.month))
      || ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month === segundaFecha.date.month)
        && primerFecha.day > segundaFecha.date.day);
  }

  onTabKey(item) {
    return !item.noResult;
  }

  onCantidadEnterPressed(item) {
    if (this.parametroModificaPrecio.valor) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[1].children[index].children[3].children[0].select();
      }
    } else {
      this.onImporteEnterPressed(item);
    }
  }

  onImporteEnterPressed(item) {
    if (this.parametroUsaDescuento.valor) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.tabla.nativeElement.children[1].children[index].children[4].children[0].select();
      }
    } else {
      this.onDescuentoEnterPressed(item);
    }
  }

  onDescuentoEnterPressed(item) {
    const index = this.items.indexOf(item);
    if (index === this.items.length - 1) {
      this.agregarNuevo(item);
    }
  }
}
