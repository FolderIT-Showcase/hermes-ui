import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Cliente} from '../../../domain/cliente';
import {Cheque} from '../../../domain/cheque';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {Banco} from '../../../domain/banco';
import {Observable} from 'rxjs/Observable';
import {ModalChequeComponent} from './modal-cheque/modal-cheque.component';

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
  chequeSeleccionado: Cheque = new Cheque();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild(ModalChequeComponent)
  modalCheque: ModalChequeComponent;
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
          text: 'Nuevo Cheque',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };

    const observableCheques = this.apiService.get('chequesterceros/buscar', this.filter);
    const observableClientes = this.apiService.get('clientes');
    const observableBancos = this.apiService.get('bancos');
    const zip = Observable.zip(observableCheques, observableClientes, observableBancos);
    zip.subscribe(data => {
        this.cheques = data[0];
        this.clientes = data[1];
        this.bancos = data[2];

        this.cheques.forEach(element => {
          element.banco_nombre = this.bancos.find(x => x.id === element.banco_id).nombre;
        });

        this.cheques.forEach(element => {
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

  mostrarModalEditar(cheque: Cheque) {
    this.chequeOriginal = cheque;
    this.modalCheque.editarCheque(cheque);
  }

  mostrarModalEliminar(cheque: Cheque) {
    this.chequeSeleccionado = cheque;
  }

  mostrarModalNuevo() {
    this.modalCheque.nuevoCheque();
  }

  eliminar() {
    this.apiService.delete('chequesterceros/' + this.chequeSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.cheques.indexOf(this.chequeSeleccionado);
        if (index !== -1) {
          this.cheques.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  handleNew(cheque: Cheque) {
    this.cheques.push(cheque);
    this.recargarTabla();
  }

  handleEdit(cheque: Cheque) {
    Object.assign(this.chequeOriginal, cheque);
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

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  // noinspection JSMethodCanBeStatic
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    ModalChequeComponent.close();
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
