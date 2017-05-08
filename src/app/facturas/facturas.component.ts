import { Component, OnInit, ViewChild } from '@angular/core';
import { Cliente } from 'domain/cliente';
import { ApiService } from '../../service/api.service';
import { TipoComprobante } from 'domain/tipocomprobante';
import { Comprobante } from 'domain/comprobante';
import { Item } from 'domain/item';
import { Articulo } from 'domain/articulo';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  cliente: Cliente = new Cliente();
  clientes: Cliente[];
  articulos: Articulo[];
  enNuevo: boolean;
  tipoComprobante: TipoComprobante = new TipoComprobante;
  factura: Comprobante = new Comprobante;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  mostrarTabla = false;
  modalTitle: String;
  itemSeleccionado: Item = new Item();
  itemOriginal: Item;
  items: Item[] = new Array<Item>();

  constructor(private apiService: ApiService) { }

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
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false
    } ]
    };

    this.cargarClientes();
    this.inicializar();
    setTimeout(() => { this.mostrarTabla = true; this.dtTrigger.next(); }, 0.2);
  }

  inicializar() {
    this.factura.punto_venta = 1;
    this.factura.importe_total = 0;
    this.factura.anulado = false;
  }

  cargarClientes() {
    this.apiService.get('clientes').subscribe( json => {
      this.clientes = json;
    });
  }

  cargarArticulos() {
    this.apiService.get('articulos').subscribe( json => {
      this.articulos = json;
    });
  }

  mostrarModalAgregar() {
    this.modalTitle = 'Agregar ítem';
    this.itemSeleccionado = new Item();
    this.enNuevo = true;
    this.cargarArticulos();
  }

  mostrarModalEditar(item: Item) {
    this.itemSeleccionado = item;
    this.enNuevo = false;
    this.modalTitle = 'Editar ítem';
    this.cargarArticulos();
    this.itemOriginal = item;
    this.itemSeleccionado = JSON.parse(JSON.stringify(item));
  }

  mostrarModalEliminar(item: Item) {
    this.itemSeleccionado = item;
  }

  editarONuevo(f: any) {
    this.itemSeleccionado.importe_total = this.itemSeleccionado.importe_unitario * this.itemSeleccionado.cantidad;
    this.itemSeleccionado.costo_unitario = 0;
    this.itemSeleccionado.importe_neto = 0;
    this.itemSeleccionado.alicuota_iva = 0;
    this.itemSeleccionado.importe_iva = 0;
    if (this.enNuevo) {
      this.enNuevo = false;
      const tmp: Item = new Item();
      Object.assign(tmp, this.itemSeleccionado);
      this.items.push(tmp);
      this.recargarTabla();
    } else {
      this.factura.importe_total -= this.itemOriginal.importe_total;
      Object.assign(this.itemOriginal, this.itemSeleccionado);
    }
    this.factura.importe_total += this.itemSeleccionado.importe_total;
    setTimeout(() => { f.reset(); }, 0.1);
  }

  eliminar(item: Item) {
    this.factura.importe_total -= item.importe_total;
    const index: number = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    this.recargarTabla();
  }

  private recargarTabla() {
// TODO buscar otra forma de reflejar los cambios en la tabla
    this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 0.1);
    });
  }

  setNombreItem() {
    this.itemSeleccionado.nombre = this.articulos.find(x => x.id === this.itemSeleccionado.articulo_id).nombre;
  }

  onClienteChanged() {
    this.apiService.get('tipocomprobantes/tiporesponsable/' + this.cliente.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      this.apiService.get('contadores/' + this.factura.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        this.factura.numero = +contador.ultimo_generado + 1;
      });
    });
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

    this.apiService.post('comprobantes', this.factura).subscribe( json => {
      this.factura = json;
    });
  }
}
