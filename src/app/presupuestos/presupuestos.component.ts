import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {Comprobante} from '../../domain/comprobante';
import {Router} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {HelperService} from '../../service/helper.service';

@Component({
  selector: 'app-presupuestos',
  templateUrl: './presupuestos.component.html',
  styleUrls: ['./presupuestos.component.css']
})
export class PresupuestosComponent implements OnInit, OnDestroy {
  mostrarBarraCarga = true;
  dtOptions: any = {};
  presupuestos: Comprobante[] = [];
  dtTrigger: Subject<any> = new Subject();
  presupuestoSeleccionado: Comprobante = new Comprobante();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private router: Router,
              private navbarTitleService: NavbarTitleService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 13,
      scrollY: '70vh',
      autoWidth: true,
      language: HelperService.defaultDataTablesLanguage(),
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nuevo Presupuesto',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.router.navigate(['/presupuestos/presupuesto/0']);
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Presupuestos');
    this.apiService.get('comprobantes/presupuestos')
      .subscribe(json => {
          this.presupuestos = json;
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
  }

  mostrarModalEliminar(presupuesto: Comprobante) {
    this.presupuestoSeleccionado = presupuesto;
  }

  eliminar() {
    this.apiService.delete('comprobantes/' + this.presupuestoSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.presupuestos.indexOf(this.presupuestoSeleccionado);
        if (index !== -1) {
          this.presupuestos.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
// TODO buscar otra forma de reflejar los cambios en la tabla
//     this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  enviarPorMail(presupuesto: Comprobante) {
    if (isNullOrUndefined(presupuesto.cliente.email)) {
      this.alertService.error('El cliente ' + presupuesto.cliente_nombre + ' no tiene un email asociado');
    } else {
      this.apiService.get('comprobantes/presupuestos/mail/' + presupuesto.id).subscribe( json => {
        if (json === 'ok') {
          this.alertService.success('Se ha enviado correctamente el mail con el presupuesto a ' + presupuesto.cliente_nombre);
        } else {
          this.alertService.error('No se ha podido enviar el mail con el presupuesto a ' + presupuesto.cliente_nombre);
        }
      });
    }
  }

  imprimirPDF(presupuesto: Comprobante) {
    this.apiService.downloadPDF('comprobantes/imprimir/' + presupuesto.id, {}).subscribe(
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

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
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
