import {Component, Input, OnInit} from '@angular/core';
import {TipoComprobante} from '../../../domain/tipocomprobante';
import {Cliente} from '../../../domain/cliente';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {Observable} from 'rxjs/Observable';
import {Comprobante} from '../../../domain/comprobante';

@Component({
  selector: 'app-nota',
  templateUrl: './nota.component.html',
  styleUrls: ['./nota.component.css']
})
export class NotaComponent implements OnInit {
  @Input() tipoNota: string;
  clienteAsync: string;
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  tipoComprobante: TipoComprobante = new TipoComprobante;
  fechaSeleccionada = false;
  busquedaCliente: string;
  busquedaClienteSeleccionado: Cliente;
  busquedaClientes: Cliente[];
  iva = 0.21;
  regexTipoA: RegExp = new RegExp('..A');
  cliente: Cliente;
  nota: Comprobante = new Comprobante;
  importe: string | number = 0.00;

  constructor(private apiService: ApiService,
              private alertService: AlertService, ) {
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
    this.cliente = new Cliente;
    this.nota.importe_total = 0;
    this.nota.fecha = new Date();
    this.nota.punto_venta = 1;
    this.nota.anulado = false;
  }

  onClienteChanged(event) {
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.apiService.get('tipocomprobantes/' + this.tipoNota + '/' + this.cliente.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      this.apiService.get('contadores/' + this.nota.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        this.nota.numero = +contador.ultimo_generado + 1;
      });
      this.calcularImportes();
    });
  }

  generarNota() {
    this.nota.cliente_id = this.cliente.id;
    this.nota.cliente_cuit = this.cliente.cuit;
    this.nota.cliente_nombre = this.cliente.nombre;
    this.nota.cliente_tipo_resp = this.cliente.tipo_responsable;
    this.nota.tipo_comprobante_id = this.tipoComprobante.id;
    this.nota.alicuota_iva = this.iva;
    this.nota.saldo = 0;
    this.nota.lista_id = this.cliente.lista_id;
    this.nota.items = [];

    if (!this.fechaSeleccionada) {
      const today = new Date();
      this.nota.fecha =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }

    this.apiService.post('comprobantes', this.nota).subscribe( () => {
      this.alertService.success('El comprobante se ha generado con éxito');
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

  onImporteChanged(importe: number) {
    this.importe = importe;
    this.calcularImportes();
  }

  private calcularImportes() {
    this.nota.importe_neto = +this.importe;
    this.nota.importe_neto = this.nota.importe_neto.toFixed(2);
    switch (this.tipoComprobante.codigo.substr(2, 1)) {
      case 'A':
        this.nota.importe_iva = (+this.nota.importe_neto * this.iva).toFixed(2);
        this.nota.importe_total = (+this.nota.importe_neto + +this.nota.importe_iva).toFixed(2);
        break;
      case 'B': case 'C': default:
      this.nota.importe_total = this.nota.importe_neto;
      break;
    }
  }
}
