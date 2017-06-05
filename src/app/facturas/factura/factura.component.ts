import {Component, Input, OnInit, Output} from '@angular/core';
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

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {
  items: Item[] = [];
  @Input() tipoFactura: string;
  @Input() cliente: Cliente;
  @Input() nuevoOEditar = 'nuevo';
  @Input() @Output() factura: Comprobante = new Comprobante;
  @Input() routeAfter: string;
  itemsABorrar: Item[] = [];
  clienteAsync: string;
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  articulos: Articulo[];
  tipoComprobante: TipoComprobante = new TipoComprobante;
  dtOptions: any = {};
  fechaSeleccionada = false;
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

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {
    this.clientes = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        observer.next(json);
      });
    });

    this.clientesCod = Observable.create((observer: any) => {
      this.apiService.get('clientes/codigo/' + this.clienteCodAsync).subscribe(json => {
        if (json !== '') {
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
      scrollY: '280px',
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

    this.inicializar();
  }

  inicializar() {
    // Si el cliente es nulo es una nueva factura y se inicializan los valores
    if (isNullOrUndefined(this.cliente)) {
      this.cliente = new Cliente;
      this.factura.importe_total = 0;
      this.factura.fecha = new Date();
      this.factura.punto_venta = 1;
      this.factura.anulado = false;
    } else {
      Object.assign(this.items, this.factura.items);
      this.clienteCodAsync = this.cliente.codigo;
      this.clienteAsync = this.cliente.nombre;
      this.apiService.get('tipocomprobantes/' + this.tipoFactura + '/' + this.cliente.tipo_responsable).subscribe( json => {
        this.tipoComprobante = json;
      });
      this.items.push(new Item);
    }

    this.cargarListasPrecios();
    this.obtenerParametros();
  }

  onClienteChanged(event) {
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.apiService.get('tipocomprobantes/' + this.tipoFactura + '/' + this.cliente.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      this.apiService.get('contadores/' + this.factura.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        this.factura.numero = +contador.ultimo_generado + 1;
      });
      this.onListaPreciosChanged();
      this.items.forEach( item => {
        this.calcularImporteUnitario(item);
        this.calcularImportesItem(item);
      });
      this.calcularImportesFactura();
      if (this.items.length === 0) {
        this.items.push(new Item);
      }
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
  }

  onCantidadChanged(item: Item) {
    this.calcularImportesItem(item);
  }

  onImporteUnitarioChanged(item: Item) {
    this.calcularImportesItem(item);
  }

  onPorcentajeDescuentoChanged(item: Item) {
    if (+item.porcentaje_descuento > +this.parametroDescuentoMax.valor) {
      item.porcentaje_descuento = +this.parametroDescuentoMax.valor;
    }
    this.calcularImportesItem(item);
  }

  calcularImportesItem(item: Item) {
    item.importe_descuento = (+item.cantidad * +item.importe_unitario * (+item.porcentaje_descuento / 100)).toFixed(2);
    item.importe_total = (+item.cantidad * +item.importe_unitario - +item.importe_descuento).toFixed(2);
    if (this.items.indexOf(item) !== this.items.length - 1) {
      this.calcularImportesFactura();
    }
  }

  agregarNuevo(item: Item) {
    if (item.articulo_id && item.cantidad && item.importe_unitario) {
      this.items.push(new Item);
      this.calcularImportesFactura();
    }
  }

  quitarItem(item: Item) {
    const index: number = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    this.calcularImportesFactura();
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
    this.factura.items = this.items.slice(0, this.items.length - 1);

    if (!this.fechaSeleccionada) {
      const today = new Date();
      this.factura.fecha =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }

    if (this.nuevoOEditar === 'nuevo') {
      this.apiService.post('comprobantes', this.factura).subscribe( () => {
        this.alertService.success('El comprobante se ha generado con éxito');
        if (!isNullOrUndefined(this.routeAfter)) {
          this.router.navigate([this.routeAfter]).catch();
        }
      });
    } else {
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
      this.calcularImporteUnitario(item);
      this.calcularImportesItem(item);
    });
    this.calcularImportesFactura();
    if (this.items.length === 0) {
      this.items.push(new Item);
    }
  }

  private calcularImportesFactura() {
    this.factura.importe_neto = 0;
    this.items.slice(0, this.items.length - 1).forEach( item => {
      this.factura.importe_neto = +this.factura.importe_neto + +item.importe_total;
    });
    this.factura.importe_neto = this.factura.importe_neto.toFixed(2);
    switch (this.tipoComprobante.nombre) {
      case 'A':
        this.factura.importe_iva = (+this.factura.importe_neto * this.iva).toFixed(2);
        this.factura.importe_total = (+this.factura.importe_neto + +this.factura.importe_iva).toFixed(2);
        break;
      case 'B': case 'C': default:
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
      switch (this.tipoComprobante.nombre) {
        case 'A':
          item.importe_unitario = (+itemLista.precio_venta).toFixed(2);
          break;
        case 'B': case 'C': default:
        item.importe_unitario = (itemLista.precio_venta * (1 + this.iva)).toFixed(2);
        break;
      }
    } else {
      item.importe_unitario = 0;
    }
  }
}
