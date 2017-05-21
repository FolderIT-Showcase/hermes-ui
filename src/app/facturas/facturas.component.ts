import { Component, OnInit } from '@angular/core';
import { Cliente } from 'domain/cliente';
import { TipoComprobante } from 'domain/tipocomprobante';
import { Comprobante } from 'domain/comprobante';
import { Item } from 'domain/item';
import { Articulo } from 'domain/articulo';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {Marca} from '../../domain/marca';
import {Rubro} from '../../domain/rubro';
import {Subrubro} from '../../domain/subrubro';
import {ListaPrecios} from '../../domain/listaPrecios';
import {Parametro} from '../../domain/parametro';
import {AuthenticationService} from '../../service/authentication.service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  itemsABorrar: Item[] = [];
  cliente: Cliente = new Cliente;
  clienteAsync: string;
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  item: Item = new Item();
  articuloAsync = '';
  articulos: Articulo[];
  articuloCodAsync = '';
  articulosCod: Articulo[];
  items: Item[] = [];
  tipoComprobante: TipoComprobante = new TipoComprobante;
  factura: Comprobante = new Comprobante;
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

  constructor(private apiService: ApiService, private alertService: AlertService, private authenticationService: AuthenticationService) {
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

    this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/nombre/' + this.articuloAsync).subscribe( json => {
        observer.next(json);
      });
    });

    this.articulosCod = Observable.create((observer: any) => {
      this.apiService.get('articulos/codigo/' + this.articuloCodAsync).subscribe( json => {
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
        'width': '30%'
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
      }]
    };

    this.inicializar();
  }

  inicializar() {
    this.factura.punto_venta = 1;
    this.factura.importe_total = 0;
    this.factura.anulado = false;
    this.factura.fecha = new Date();
    this.cargarListasPrecios();
    this.obtenerParametros();
  }

  onClienteChanged(event) {
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.apiService.get('tipocomprobantes/tiporesponsable/' + this.cliente.tipo_responsable).subscribe( json => {
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
    });
  }

  onArticuloChanged(articulo: Articulo) {
    this.item.codigo = articulo.codigo;
    this.item.nombre = articulo.nombre;
    this.item.articulo_id = articulo.id;
    this.item.costo_unitario = +articulo.costo;
    this.articuloAsync = this.item.nombre;
    this.articuloCodAsync = articulo.codigo;
    if (!isNullOrUndefined(this.listaPreciosSeleccionada)) {
      this.calcularImporteUnitario(this.item);
      this.calcularImportesItem(this.item);
    }
  }

  onCantidadChanged() {
    this.calcularImportesItem(this.item);
  }

  onImporteUnitarioChanged() {
    this.calcularImportesItem(this.item);
  }

  onPorcentajeDescuentoChanged() {
    if (+this.item.porcentaje_descuento > +this.parametroDescuentoMax.valor) {
      this.item.porcentaje_descuento = +this.parametroDescuentoMax.valor;
    }
    this.calcularImportesItem(this.item);
  }

  calcularImportesItem(item: Item) {
    item.importe_descuento = (+item.cantidad * +item.importe_unitario * (+item.porcentaje_descuento / 100)).toFixed(2);
    item.importe_total = (+item.cantidad * +item.importe_unitario - +item.importe_descuento).toFixed(2);
  }

  agregarNuevo() {
    if (this.item.articulo_id && this.item.cantidad && this.item.importe_unitario) {
      const itemNuevo = new Item();
      Object.assign(itemNuevo, this.item);
      this.items.push(itemNuevo);
      this.calcularImportesFactura();
      this.item = new Item();
      this.articuloAsync = '';
      this.articuloCodAsync = '';
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
    this.factura.items = this.items;

    if (!this.fechaSeleccionada) {
      const today = new Date();
      this.factura.fecha =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }

    this.apiService.post('comprobantes', this.factura).subscribe( json => {
      this.factura = json;
      this.alertService.success('Se ha generado la factura con éxito');
    });
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

  mostrarModalBuscarArticulos() {
    this.cargarMarcas();
    this.cargarRubros();
    this.cargarSubrubros();
    this.busquedaArticuloMarcaId = null;
    this.busquedaArticuloRubroId = null;
    this.busquedaArticuloSubrubroId = null;
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
    this.apiService.get('articulos/buscar/' + this.busquedaArticuloMarcaId + '/'
      + this.busquedaArticuloRubroId + '/'
      + this.busquedaArticuloSubrubroId + '/'
      + this.busquedaArticulo).subscribe( json => {
      json.forEach( art => {
        art.marca_nombre = this.marcas.find(x => x.id === art.marca_id).nombre;
        art.rubro_nombre = this.rubros.find(x => x.id === art.subrubro.rubro_id).nombre;
        art.subrubro_nombre = this.subrubros.find(x => x.id === art.subrubro_id).nombre;
      });
      this.busquedaArticulos = json;
    });
  }

  confirmarBusquedaArticulo() {
    this.articuloAsync = this.busquedaArticuloSeleccionado.nombre;
    this.onArticuloChanged(this.busquedaArticuloSeleccionado);
  }

  private cargarListasPrecios() {
    this.apiService.get('listaprecios').subscribe(json => {
      this.listasPrecios = json;
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
      $('#modalCambiarListaPrecios').modal('show');
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
  }

  private calcularImportesFactura() {
    this.factura.importe_neto = 0;
    this.items.forEach( item => {
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
          item.importe_unitario = itemLista.precio_venta;
          break;
        case 'B': case 'C': default:
          item.importe_unitario = (itemLista.precio_venta * (1 + this.iva)).toFixed(2);
          break;
      }
    }
  }
}
