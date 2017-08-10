import {Component, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.component.html',
  styleUrls: ['./abm.component.css']
})
export class AbmComponent implements OnInit, OnDestroy {
  @Input() dtOptions: any = {};
  @Input() femenino = false;
  @Input() nombreElemento = 'elemento';
  @Input() articuloElemento = 'el';
  @Input() pluralElemento = this.nombreElemento + 's';
  @Input() path: string;
  @Input() elementClass: any;
  @Input()  tableHeader: TemplateRef<any>;
  @Input()  tableBody: TemplateRef<any>;
  @Input()  modalBody: TemplateRef<any>;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  elements: any[] = [];
  dtTrigger: Subject<any> = new Subject();
  elementSeleccionado = {id: '0'};
  modalTitle: string;
  enNuevo: boolean;
  elementOriginal: any;
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
          text: (this.femenino ? 'Nueva ' : 'Nuevo ') + this.nombreElemento,
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de ' + this.pluralElemento);
    this.apiService.get(this.path)
      .subscribe(json => {
          this.elements = json;
          // TODO callback to parent
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
  }


  mostrarModalNuevo() {
    this.modalTitle = (this.femenino ? 'Nueva ' : 'Nuevo ') + this.nombreElemento;
    this.enNuevo = true;
    this.elementSeleccionado = new this.elementClass();
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEditar(element: any) {
    this.modalTitle = 'Editar ' + this.nombreElemento;
    this.enNuevo = false;
    this.elementOriginal = element;
    this.elementSeleccionado = JSON.parse(JSON.stringify(element));
  }

  mostrarModalEliminar(element: any) {
    this.elementSeleccionado = element;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const elementAEnviar = {id: ''};
      Object.assign(elementAEnviar, this.elementSeleccionado);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post(this.path, elementAEnviar).subscribe(
          json => {
            // TODO callback to parent
            this.elements.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put(this.path + '/' + elementAEnviar.id, elementAEnviar).subscribe(
          json => {
            // TODO callback to parent
            Object.assign(this.elementOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete(this.path + '/' + this.elementSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.elements.indexOf(this.elementSeleccionado);
        if (index !== -1) {
          this.elements.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
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
