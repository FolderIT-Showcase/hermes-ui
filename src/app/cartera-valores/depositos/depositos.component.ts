import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Cliente} from '../../../domain/cliente';
import {Subject} from 'rxjs/Subject';
import {CuentaBancaria} from '../../../domain/cuentaBancaria';
import {Deposito} from '../../../domain/deposito';
import {DataTableDirective} from 'angular-datatables';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-depositos',
  templateUrl: './depositos.component.html',
  styleUrls: ['./depositos.component.css']
})
export class DepositosComponent implements OnInit, OnDestroy {
  @Input() filter: any;
  enNuevo: boolean;
  clientes: Cliente[] = [];
  cuentas: CuentaBancaria[] = [];
  depositoOriginal: Deposito;
  dtOptions: any = {};
  depositos: Deposito[] = [];
  dtTrigger: Subject<any> = new Subject();
  depositoSeleccionado: Deposito = new Deposito();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
  myDatePickerOptions: IMyDpOptions;
  constructor(private apiService: ApiService,
              private alertService: AlertService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 12,
      scrollY: '63.5vh',
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
        'orderable': false,
        'width': '5%'
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nuevo Depósito',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };

    const observableCheques = this.apiService.get('depositos/buscar', this.filter);
    const observableClientes = this.apiService.get('clientes');
    const zip = Observable.zip(observableCheques, observableClientes);
    zip.subscribe(data => {
        this.depositos = data[0];
        this.clientes = data[1];

        this.depositos.forEach(element => {
          if (!!element.cliente_id) {
            element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
          }
        });

        this.mostrarBarraCarga = false;
        this.mostrarTabla = true;
        this.dtTrigger.next();
      },
      () => {
        this.mostrarBarraCarga = false;
      });

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
  }

  mostrarModalEditar(deposito: Deposito) {
    this.modalTitle = 'Editar Depósito';
    this.enNuevo = false;
    this.depositoOriginal = deposito;
    this.depositoSeleccionado = JSON.parse(JSON.stringify(deposito));

    let month = this.depositoSeleccionado.fecha_ingreso.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.depositoSeleccionado.fecha_ingreso.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.depositoSeleccionado.fecha_ingreso =  {
      date: {
        year: this.depositoSeleccionado.fecha_ingreso.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    if (!!this.depositoSeleccionado.fecha_acreditacion) {
      month = this.depositoSeleccionado.fecha_acreditacion.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.depositoSeleccionado.fecha_acreditacion.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.depositoSeleccionado.fecha_acreditacion =  {
        date: {
          year: this.depositoSeleccionado.fecha_acreditacion.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }

    if (!!this.depositoSeleccionado.fecha_deposito) {
      month = this.depositoSeleccionado.fecha_deposito.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.depositoSeleccionado.fecha_deposito.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.depositoSeleccionado.fecha_deposito =  {
        date: {
          year: this.depositoSeleccionado.fecha_deposito.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }
  }

  mostrarModalEliminar(deposito: Deposito) {
    this.depositoSeleccionado = deposito;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;

      // Máscara para mostrar siempre 2 decimales
      const num = this.depositoSeleccionado.importe;
      this.depositoSeleccionado.importe = !isNaN(+num) ? (+num).toFixed(2) : num;

      (<any>$('#modalEditar')).modal('hide');
      const depositoAEnviar = new Deposito();
      Object.assign(depositoAEnviar, this.depositoSeleccionado);
      depositoAEnviar.fecha_ingreso = depositoAEnviar.fecha_ingreso.date.year + '-' + depositoAEnviar.fecha_ingreso.date.month + '-' + depositoAEnviar.fecha_ingreso.date.day;
      if (!!depositoAEnviar.fecha_acreditacion) {
        depositoAEnviar.fecha_acreditacion = depositoAEnviar.fecha_acreditacion.date.year + '-' + depositoAEnviar.fecha_acreditacion.date.month + '-' + depositoAEnviar.fecha_acreditacion.date.day;
      }
      if (!!depositoAEnviar.fecha_deposito) {
        depositoAEnviar.fecha_deposito = depositoAEnviar.fecha_deposito.date.year + '-' + depositoAEnviar.fecha_deposito.date.month + '-' + depositoAEnviar.fecha_deposito.date.day;
      }
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('depositos', depositoAEnviar).subscribe(
          json => {
            if (!!json.cliente_id) {
              json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            }
            this.depositos.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('depositos/' + depositoAEnviar.id, depositoAEnviar).subscribe(
          json => {
            if (!!json.cliente_id) {
              json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            }
            Object.assign(this.depositoOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Depósito';
    this.enNuevo = true;
    this.depositoSeleccionado = new Deposito;
    const today = new Date();
    this.depositoSeleccionado.fecha_ingreso =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('depositos/' + this.depositoSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.depositos.indexOf(this.depositoSeleccionado);
        if (index !== -1) {
          this.depositos.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
//     this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  cargarClientes() {
    if (this.clientes.length === 0) {
      this.apiService.get('clientes').subscribe(
        json => {
          this.clientes = json;
          this.depositos.forEach(element => {
            if (!!element.cliente_id) {
              element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
            }
          });
        }
      );
    }
  }

  cargarCuentasBancarias() {
    if (this.cuentas.length === 0) {
      this.apiService.get('cuentasbancarias').subscribe(
        json => {
          this.cuentas = json;
        }
      );
    }
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
    (<any>$('#modalEliminar')).modal('hide');
  }

  ngOnDestroy() {
    this.ocultarModals();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
