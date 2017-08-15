import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Banco} from '../../domain/banco';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {HelperService} from '../../service/helper.service';

@Component({
  selector: 'app-banco',
  templateUrl: './banco.component.html',
  styleUrls: ['./banco.component.css']
})
export class BancoComponent implements OnInit, OnDestroy {


  enNuevo: boolean;
  bancoOriginal: Banco;
  dtOptions: any = {};
  bancos: Banco[] = [];
  dtTrigger: Subject<any> = new Subject();
  bancoSeleccionada: Banco = new Banco();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
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
          text: 'Nuevo Banco',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Bancos');
    this.apiService.get('bancos')
      .subscribe(json => {
          this.bancos = json;
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
  }

  mostrarModalEditar(banco: Banco) {
    this.modalTitle = 'Editar Banco';
    this.enNuevo = false;
    this.bancoOriginal = banco;
    this.bancoSeleccionada = JSON.parse(JSON.stringify(banco));
  }

  mostrarModalEliminar(banco: Banco) {
    this.bancoSeleccionada = banco;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const bancoAEnviar = new Banco();
      Object.assign(bancoAEnviar, this.bancoSeleccionada);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('bancos', bancoAEnviar).subscribe(
          json => {
            this.bancos.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('bancos/' + bancoAEnviar.id, bancoAEnviar).subscribe(
          json => {
            Object.assign(this.bancoOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Banco';
    this.enNuevo = true;
    this.bancoSeleccionada = new Banco;
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('bancos/' + this.bancoSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.bancos.indexOf(this.bancoSeleccionada);
        if (index !== -1) {
          this.bancos.splice(index, 1);
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
