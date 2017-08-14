import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CuentaBancaria} from '../../domain/cuentaBancaria';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {Banco} from '../../domain/banco';
import {HelperService} from '../../service/helper.service';

@Component({
  selector: 'app-cuenta-bancaria',
  templateUrl: './cuenta-bancaria.component.html',
  styleUrls: ['./cuenta-bancaria.component.css']
})
export class CuentaBancariaComponent implements OnInit, OnDestroy {

  enNuevo: boolean;
  cuentaBancariaOriginal: CuentaBancaria;
  dtOptions: any = {};
  cuentaBancarias: CuentaBancaria[] = [];
  dtTrigger: Subject<any> = new Subject();
  cuentaBancariaSeleccionada: CuentaBancaria = new CuentaBancaria();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
  bancos: Banco[] = [];

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 13,
      scrollY: '70vh',
      language: HelperService.defaultDataTablesLanguage(),
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nueva Cuenta Bancaria',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Cuentas Bancarias');
    this.cargarBancos();
  }

  mostrarModalEditar(cuentaBancaria: CuentaBancaria) {
    this.modalTitle = 'Editar Cuenta Bancaria';
    this.enNuevo = false;
    this.cuentaBancariaOriginal = cuentaBancaria;
    this.cuentaBancariaSeleccionada = JSON.parse(JSON.stringify(cuentaBancaria));
  }

  mostrarModalEliminar(cuentaBancaria: CuentaBancaria) {
    this.cuentaBancariaSeleccionada = cuentaBancaria;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const cuentaBancariaAEnviar = new CuentaBancaria();
      Object.assign(cuentaBancariaAEnviar, this.cuentaBancariaSeleccionada);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('cuentasbancarias', cuentaBancariaAEnviar).subscribe(
          json => {
            json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
            this.cuentaBancarias.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('cuentasbancarias/' + cuentaBancariaAEnviar.id, cuentaBancariaAEnviar).subscribe(
          json => {
            json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
            Object.assign(this.cuentaBancariaOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nueva Cuenta Bancaria';
    this.enNuevo = true;
    this.cuentaBancariaSeleccionada = new CuentaBancaria;
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('cuentasbancarias/' + this.cuentaBancariaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.cuentaBancarias.indexOf(this.cuentaBancariaSeleccionada);
        if (index !== -1) {
          this.cuentaBancarias.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  cargarBancos() {
    if (this.bancos.length === 0) {
      this.apiService.get('bancos').subscribe(
        jsonBancos => {
          this.bancos = jsonBancos;
          this.apiService.get('cuentasbancarias')
            .subscribe(json => {
                json.forEach(element => {
                  element.banco_nombre = this.bancos.find(x => x.id === element.banco_id).nombre;
                });
                this.cuentaBancarias = json;
                this.mostrarBarraCarga = false;
                this.mostrarTabla = true;
                this.dtTrigger.next();
              },
              () => {
                this.mostrarBarraCarga = false;
              });
        },
        () => {
          this.mostrarBarraCarga = false;
        }
      );
    }
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
