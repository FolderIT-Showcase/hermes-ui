import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { Proveedor } from 'domain/proveedor';
import {ApiService} from '../../service/api.service';
import {Subject} from 'rxjs/Subject';
import {isNullOrUndefined} from 'util';
import {DataTableDirective} from 'angular-datatables';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit, AfterViewChecked, OnDestroy {
  mostrarTabla = false;
  proveedores: Proveedor[] = [];
  enNuevo: boolean;
  modalTitle: string;
  proveedorSeleccionado: Proveedor = new Proveedor;
  proveedorOriginal: Proveedor;
  submitted = false;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject;
  tipos_responsable = [];
  cuitmask = [/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/];
  telmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  celmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', '1', '5', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  mostrarBarraCarga = true;

  constructor(private apiService: ApiService,
              private cdRef: ChangeDetectorRef,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {}

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      // aaSorting: [1, 'DESC'],
      pageLength: 13,
      scrollY: '70vh',
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
          text: 'Nuevo Proveedor',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
           this.mostrarModalNuevo();
          }
        }
        /*, {
          text: 'Listado',
          key: '2',
          className: 'btn btn-default',
          action: () => {
            // TODO setear accion this.mostrarModalReporte(); para mostrar "filtros" para el ListarProveedores
          }
        }
        */
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Proveedores');
    this.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'M', nombre: 'Monotributista'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'}
    ];

    this.apiService.get('proveedores')
      .subscribe(json => {
        this.proveedores = json;
        this.proveedores.forEach(
          proveedor => {
            proveedor.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === proveedor.tipo_responsable).nombre;
          });
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
      });
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('proveedores/' + this.proveedorSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.proveedores.indexOf(this.proveedorSeleccionado);
        if (index !== -1) {
          this.proveedores.splice(index, 1);
        }
        this.recargarTabla();
        this.cerrar(null);
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  cerrar(f) {
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 200);
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Proveedor';
    this.enNuevo = true;
    this.proveedorSeleccionado = new Proveedor;
    this.proveedorSeleccionado.activo = true;
    this.proveedorSeleccionado.tipo_responsable = 'RI';
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalEliminar(proveedor: Proveedor) {
    this.proveedorSeleccionado = proveedor;
  }

  mostrarModalEditar(proveedor: Proveedor) {
    this.modalTitle = 'Editar Proveedor';
    this.enNuevo = false;
    this.proveedorOriginal = proveedor;
    this.proveedorSeleccionado = JSON.parse(JSON.stringify(proveedor));
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      const proveedorAEnviar = new Proveedor;
      Object.assign(proveedorAEnviar, this.proveedorSeleccionado);
      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('proveedores', proveedorAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === proveedorAEnviar.tipo_responsable).nombre;
            this.proveedores.push(json);
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('proveedores/' + proveedorAEnviar.id, proveedorAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === proveedorAEnviar.tipo_responsable).nombre;
            Object.assign(this.proveedorOriginal, json);
          }
        );
      }
    }
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

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
    (<any>$('#modalEliminar')).modal('hide');
    (<any>$('#modalReporte')).modal('hide');
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
