import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subrubro } from 'domain/subrubro';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import { Rubro } from 'domain/rubro';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-subrubros',
  templateUrl: './subrubros.component.html',
  styleUrls: ['./subrubros.component.css']
})
export class SubrubrosComponent implements OnInit, OnDestroy {

  enNuevo: boolean;
  subrubroOriginal: Subrubro;
  dtOptions: any = {};
  subrubros: Subrubro[] = [];
  rubros: Rubro[] = [];
  dtTrigger: Subject<any> = new Subject();
  subrubroSeleccionado: Subrubro = new Subrubro();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  submitted = false;
  mostrarBarraCarga = true;

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
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
          text: 'Nuevo Subrubro',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Subrubros');
    this.cargarRubros();
  }

  mostrarModalEditar(subrubro: Subrubro) {
    this.modalTitle = 'Editar Subrubro';
    this.enNuevo = false;
    this.subrubroOriginal = subrubro;
    this.subrubroSeleccionado = JSON.parse(JSON.stringify(subrubro));
  }

  mostrarModalEliminar(subrubro: Subrubro) {
    this.subrubroSeleccionado = subrubro;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const subrubroAEnviar = new Subrubro();
      Object.assign(subrubroAEnviar, this.subrubroSeleccionado);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('subrubros', subrubroAEnviar).subscribe(
          json => {
            json.rubro_nombre = this.rubros.find(x => x.id === json.rubro_id).nombre;
            this.subrubros.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('subrubros/' + subrubroAEnviar.id, subrubroAEnviar).subscribe(
          json => {
            json.rubro_nombre = this.rubros.find(x => x.id === json.rubro_id).nombre;
            Object.assign(this.subrubroOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Subrubro';
    this.enNuevo = true;
    this.subrubroSeleccionado = new Subrubro;
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('subrubros/' + this.subrubroSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.subrubros.indexOf(this.subrubroSeleccionado);
        if (index !== -1) {
          this.subrubros.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
// TODO buscar otra forma de reflejar los cambios en la tabla
    this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  cargarRubros() {
    if (this.rubros.length === 0) {
      this.apiService.get('rubros').subscribe(
        jsonRubros => {
          this.rubros = jsonRubros;
          this.apiService.get('subrubros')
            .subscribe(json => {
                json.forEach(element => {
                  element.rubro_nombre = this.rubros.find(x => x.id === element.rubro_id).nombre;
                });
                this.subrubros = json;
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
