import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Cliente} from '../../../domain/cliente';
import {Cheque} from '../../../domain/cheque';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {Banco} from '../../../domain/banco';

@Component({
  selector: 'app-cheques',
  templateUrl: './cheques.component.html',
  styleUrls: ['./cheques.component.css']
})
export class ChequesComponent implements OnInit, OnDestroy {
  @Input() filter: any;
  enNuevo: boolean;
  clientes: Cliente[] = [];
  bancos: Banco[] = [];
  chequeOriginal: Cheque;
  dtOptions: any = {};
  cheques: Cheque[] = [];
  dtTrigger: Subject<any> = new Subject();
  chequeSeleccionada: Cheque = new Cheque();
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
          text: 'Nuevo Cheque',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.apiService.get('chequesterceros/buscar', this.filter)
      .subscribe(json => {
          this.cheques = json;
          this.cargarClientes();
          this.cargarBancos();
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

  mostrarModalEditar(cheque: Cheque) {
    this.modalTitle = 'Editar Cheque';
    this.enNuevo = false;
    this.chequeOriginal = cheque;
    this.chequeSeleccionada = JSON.parse(JSON.stringify(cheque));

    let month = this.chequeSeleccionada.fecha_emision.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.chequeSeleccionada.fecha_emision.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.chequeSeleccionada.fecha_emision =  {
      date: {
        year: this.chequeSeleccionada.fecha_emision.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    month = this.chequeSeleccionada.fecha_ingreso.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    day = this.chequeSeleccionada.fecha_ingreso.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.chequeSeleccionada.fecha_ingreso =  {
      date: {
        year: this.chequeSeleccionada.fecha_ingreso.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    month = this.chequeSeleccionada.fecha_vencimiento.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    day = this.chequeSeleccionada.fecha_vencimiento.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.chequeSeleccionada.fecha_vencimiento =  {
      date: {
        year: this.chequeSeleccionada.fecha_vencimiento.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    month = this.chequeSeleccionada.fecha_cobro.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    day = this.chequeSeleccionada.fecha_cobro.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.chequeSeleccionada.fecha_cobro =  {
      date: {
        year: this.chequeSeleccionada.fecha_cobro.toString().slice(0, 4),
        month: month,
        day: day
      }
    };
  }

  mostrarModalEliminar(cheque: Cheque) {
    this.chequeSeleccionada = cheque;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const chequeAEnviar = new Cheque();
      Object.assign(chequeAEnviar, this.chequeSeleccionada);
      chequeAEnviar.fecha_emision = chequeAEnviar.fecha_emision.date.year + '-' + chequeAEnviar.fecha_emision.date.month + '-' + chequeAEnviar.fecha_emision.date.day;
      chequeAEnviar.fecha_ingreso = chequeAEnviar.fecha_ingreso.date.year + '-' + chequeAEnviar.fecha_ingreso.date.month + '-' + chequeAEnviar.fecha_ingreso.date.day;
      chequeAEnviar.fecha_vencimiento = chequeAEnviar.fecha_vencimiento.date.year + '-' + chequeAEnviar.fecha_vencimiento.date.month + '-' + chequeAEnviar.fecha_vencimiento.date.day;
      chequeAEnviar.fecha_cobro = chequeAEnviar.fecha_cobro.date.year + '-' + chequeAEnviar.fecha_cobro.date.month + '-' + chequeAEnviar.fecha_cobro.date.day;
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('chequesterceros', chequeAEnviar).subscribe(
          json => {
            json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
            json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            this.cheques.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('chequesterceros/' + chequeAEnviar.id, chequeAEnviar).subscribe(
          json => {
            json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
            json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            Object.assign(this.chequeOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Cheque';
    this.enNuevo = true;
    this.chequeSeleccionada = new Cheque;
    const today = new Date();
    this.chequeSeleccionada.fecha_emision =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.chequeSeleccionada.fecha_ingreso =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.chequeSeleccionada.fecha_vencimiento =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.chequeSeleccionada.fecha_cobro =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('chequesterceros/' + this.chequeSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.cheques.indexOf(this.chequeSeleccionada);
        if (index !== -1) {
          this.cheques.splice(index, 1);
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
          this.cheques.forEach(element => {
            element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
          });
        }
      );
    }
  }

  cargarBancos() {
    if (this.bancos.length === 0) {
      this.apiService.get('bancos').subscribe(
        json => {
          this.bancos = json;
          this.cheques.forEach(element => {
            element.banco_nombre = this.bancos.find(x => x.id === element.banco_id).nombre;
          });
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
