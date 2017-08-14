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
import {ModalDepositoComponent} from './modal-deposito/modal-deposito.component';

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
  @ViewChild(ModalDepositoComponent)
  modalDeposito: ModalDepositoComponent;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
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
    this.cargarCuentasBancarias();

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
    this.depositoOriginal = deposito;
    this.modalDeposito.editarDeposito(deposito);
  }

  mostrarModalEliminar(deposito: Deposito) {
    this.depositoSeleccionado = deposito;
  }

  mostrarModalNuevo() {
    this.modalDeposito.nuevoDeposito();
  }

  eliminar() {
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

  cargarCuentasBancarias() {
    if (this.cuentas.length === 0) {
      this.apiService.get('cuentasbancarias').subscribe(
        json => {
          this.cuentas = json;
        }
      );
    }
  }

  handleNew(deposito: Deposito) {
    this.depositos.push(deposito);
    this.recargarTabla();
  }

  handleEdit(deposito: Deposito) {
    Object.assign(this.depositoOriginal, deposito);
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  // noinspection JSMethodCanBeStatic
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    ModalDepositoComponent.close();
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
