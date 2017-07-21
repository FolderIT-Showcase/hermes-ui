import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Vendedor } from 'domain/vendedor';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.css']
})
export class VendedoresComponent implements OnInit, OnDestroy {
  mostrarBarraCarga = true;
  enNuevo: boolean;
  vendedorOriginal: Vendedor;
  dtOptions: any = {};
  vendedores: Vendedor[] = [];
  dtTrigger: Subject<any> = new Subject();
  vendedorSeleccionado: Vendedor = new Vendedor();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  zonas: any;
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
        'orderable': false
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nuevo Vendedor',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Vendedores');
    this.apiService.get('vendedores')
      .subscribe(json => {
          this.vendedores = json;
          this.cargarZonas();
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
  }

  mostrarModalEditar(vendedor: Vendedor) {
    this.modalTitle = 'Editar Vendedor';
    this.enNuevo = false;
    this.vendedorOriginal = vendedor;
    this.vendedorSeleccionado = JSON.parse(JSON.stringify(vendedor));
    this.cargarZonas();
  }

  mostrarModalEliminar(vendedor: Vendedor) {
    this.vendedorSeleccionado = vendedor;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      // Máscara para mostrar siempre 2 decimales
      const num = this.vendedorSeleccionado.comision;
      this.vendedorSeleccionado.comision = !isNaN(+num) ? (+num).toFixed(2) : num;

      const vendedorAEnviar = new Vendedor();
      Object.assign(vendedorAEnviar, this.vendedorSeleccionado);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('vendedores', vendedorAEnviar).subscribe(
          json => {
            json.zona_nombre = this.zonas.find(x => x.id === json.zona_id).nombre;
            this.vendedores.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('vendedores/' + vendedorAEnviar.id, vendedorAEnviar).subscribe(
          json => {
            json.zona_nombre = this.zonas.find(x => x.id === json.zona_id).nombre;
            Object.assign(this.vendedorOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    (<any>$('#modalEditar')).modal('show');
    this.modalTitle = 'Nuevo Vendedor';
    this.enNuevo = true;
    this.vendedorSeleccionado = new Vendedor;
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('vendedores/' + this.vendedorSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.vendedores.indexOf(this.vendedorSeleccionado);
        if (index !== -1) {
          this.vendedores.splice(index, 1);
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

  cargarZonas() {
    this.apiService.get('zonas').subscribe(
      json => {
        this.zonas = json;
        this.vendedores.forEach(element => {
          element.zona_nombre = this.zonas.find(x => x.id === element.zona_id).nombre;
        });
      }
    );
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
