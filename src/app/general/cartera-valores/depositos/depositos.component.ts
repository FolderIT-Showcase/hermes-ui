import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Cliente} from '../../../shared/domain/cliente';
import {Subject} from 'rxjs/Subject';
import {CuentaBancaria} from '../../../shared/domain/cuentaBancaria';
import {Deposito} from '../../../shared/domain/deposito';
import {DataTableDirective} from 'angular-datatables';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../shared/services/api.service';
import {AlertService} from '../../../shared/services/alert.service';
import {Observable} from 'rxjs/Observable';
import {ModalDepositoComponent} from './modal-deposito/modal-deposito.component';
import {HelperService} from '../../../shared/services/helper.service';

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
      language: HelperService.defaultDataTablesLanguage(),
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

    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();
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
