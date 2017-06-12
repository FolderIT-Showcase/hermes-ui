import { Component, OnInit } from '@angular/core';
import {Cliente} from '../../domain/cliente';
import {CtaCteCliente} from '../../domain/ctaCteCliente';
import {ApiService} from '../../service/api.service';
import {Observable} from 'rxjs/Observable';
import {Comprobante} from '../../domain/comprobante';
import {TipoComprobante} from '../../domain/tipocomprobante';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-cta-cte-clientes',
  templateUrl: './cta-cte-clientes.component.html',
  styleUrls: ['./cta-cte-clientes.component.css']
})
export class CtaCteClientesComponent implements OnInit {
  clienteCtaCteSeleccionado: Cliente;
  fechaInicioCtaCte: Date | string;
  fechaFinCtaCte: Date | string;
  registrosCtaCte: CtaCteCliente[];
  fechaSeleccionadaCtaCte: false;
  clienteCtaCteAsync: string;
  clientesCtaCte: Cliente[];
  comprobante: Comprobante;
  iva = 0.21;
  saldo = 0.00;
  dtOptions: any;
  regexTipoA: RegExp = new RegExp('..A');

  constructor(private apiService: ApiService, private alertService: AlertService) {
    this.comprobante = new Comprobante;
    this.comprobante.tipo_comprobante = new TipoComprobante;
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
      scrollY: '350px',
      paging: false,
      columnDefs: [ {
        'targets': 0,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 1,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 2,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }, {
        'targets': 3,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 4,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 6,
        'searchable': false,
        'orderable': false,
        'width': '5%'
      } ]
    };

    this.clienteCtaCteSeleccionado = new Cliente;
    this.fechaSeleccionadaCtaCte = false;
    this.fechaInicioCtaCte = new Date;
    this.fechaFinCtaCte = new Date;
    this.clienteCtaCteAsync = '';
    this.registrosCtaCte = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth(), pastYear.getDate());
    this.fechaInicioCtaCte =  pastYear.getFullYear() + '-' + (pastYear.getMonth() + 1) + '-' + pastYear.getDate();
    const today = new Date();
    this.fechaFinCtaCte =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    this.clientesCtaCte = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteCtaCteAsync).subscribe(json => {
        observer.next(json);
      });
    });
  }

  filtrarCtaCte() {
    let fechaInicioAEnviar = this.fechaInicioCtaCte;
    const fechaFinAEnviar = this.fechaFinCtaCte;
    if (!this.fechaSeleccionadaCtaCte) {
      const initialYear = new Date();
      initialYear.setTime(0);
      fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
    }

    this.apiService.get('cuentacorriente/buscar', {
      'cliente_id': this.clienteCtaCteSeleccionado.id,
      'fecha_inicio': fechaInicioAEnviar,
      'fecha_fin': fechaFinAEnviar,
    }).subscribe( json => {
      this.registrosCtaCte = json;
      this.saldo = 0.0;
      this.registrosCtaCte.forEach( reg => {
        this.saldo += +reg.debe;
        this.saldo -= +reg.haber;
        reg.saldo = this.saldo.toFixed(2);
      });
      setTimeout(() => {$('#table').DataTable().columns.adjust(); }, 100);
    });
  }

  onClienteCtaCteChanged(event) {
    this.clienteCtaCteSeleccionado = event;
    this.clienteCtaCteAsync = this.clienteCtaCteSeleccionado.nombre;
  }

  imprimirReporteCtaCte() {
    let fechaInicioAEnviar = this.fechaInicioCtaCte;
    const fechaFinAEnviar = this.fechaFinCtaCte;
    if (!this.fechaSeleccionadaCtaCte) {
      const initialYear = new Date();
      initialYear.setTime(0);
      fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
    }

    this.apiService.downloadPDF('cuentacorriente/reporte', {
      'cliente_id': this.clienteCtaCteSeleccionado.id,
      'fecha_inicio': fechaInicioAEnviar,
      'fecha_fin': fechaFinAEnviar,
      }
    ).subscribe(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        try {
          const win = window.open(fileURL, '_blank');
          win.print();
        } catch (e) {
          this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
        }
      }
    );
  }

  mostrarModalVer(ctaCteCliente: CtaCteCliente) {
    this.apiService.get('comprobantes/' + ctaCteCliente.comprobante_id).subscribe( json => {
      this.comprobante = json;
      this.comprobante.items.forEach( item => {
        item.nombre = item.articulo.nombre;
        item.codigo = item.articulo.codigo;
        item.porcentaje_descuento = '0.00';
        item.importe_descuento = '0.00';
      });
      $('#modalVer').modal('show');
    });
  }

  cerrar() {
  }
}
