import { Component, OnInit } from '@angular/core';
import { Cliente } from 'domain/cliente';
import { TipoComprobante } from 'domain/tipocomprobante';
import { Comprobante } from 'domain/comprobante';
import { Item } from 'domain/item';
import { Articulo } from 'domain/articulo';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  cliente: Cliente;
  clienteAsync: string;
  clientes: any;
  item: Item = new Item();
  articuloAsync = '';
  articulos: Articulo[];
  items: Item[] = [];
  tipoComprobante: TipoComprobante = new TipoComprobante;
  factura: Comprobante = new Comprobante;
  dtOptions: any = {};
  fechaSeleccionada = false;

  constructor(private apiService: ApiService, private alertService: AlertService) {
    this.clientes = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        observer.next(json);
      });
    });

     this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/nombre/' + this.articuloAsync).subscribe( json => {
        observer.next(json);
      });
     });
  }

  ngOnInit() {
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
      dom: '',
      columnDefs: [ {
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
      } ]
    };

    this.inicializar();
  }

  inicializar() {
    this.factura.punto_venta = 1;
    this.factura.importe_total = 0;
    this.factura.anulado = false;
    this.factura.fecha = new Date();
  }

  onClienteChanged(event) {
    this.cliente = event.item;
    this.apiService.get('tipocomprobantes/tiporesponsable/' + this.cliente.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      this.apiService.get('contadores/' + this.factura.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        this.factura.numero = +contador.ultimo_generado + 1;
      });
    });
  }

  onArticuloChanged(event) {
    this.item.nombre = event.item.nombre;
    this.item.articulo_id = event.item.id;
  }

  onCantidadChanged() {
    this.item.importe_total = +this.item.cantidad * +this.item.importe_unitario;
  }

  onImporteUnitarioChanged() {
    this.item.importe_total = +this.item.cantidad * +this.item.importe_unitario;

  }

  agregarNuevo() {
    if (this.item.articulo_id && this.item.cantidad && this.item.importe_unitario) {
      const itemNuevo = new Item();
      Object.assign(itemNuevo, this.item);
      this.items.push(itemNuevo);
      this.factura.importe_total += itemNuevo.importe_total;
      this.item = new Item();
      this.articuloAsync = '';
    }
  }

  generarFactura() {
    this.factura.cliente_id = this.cliente.id;
    this.factura.cliente_cuit = this.cliente.cuit;
    this.factura.cliente_nombre = this.cliente.nombre;
    this.factura.cliente_tipo_resp = this.cliente.tipo_responsable;
    this.factura.tipo_comprobante_id = this.tipoComprobante.id;
    this.factura.importe_neto = 0;
    this.factura.alicuota_iva = 0;
    this.factura.importe_iva = 0;
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
}
