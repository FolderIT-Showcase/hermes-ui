import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { User as Usuario} from 'domain/user';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import { Rubro } from 'domain/rubro';
import {UserService} from '../../service/user.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  enNuevo: boolean;
  usuarioOriginal: Usuario;
  dtOptions: any = {};
  usuarios: Usuario[] = [];
  rubros: Rubro[] = [];
  dtTrigger: Subject<any> = new Subject();
  usuarioSeleccionado: Usuario = new Usuario();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  submitted = false;
  roles = [];

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private userService: UserService,
              private changeDetectionRef: ChangeDetectorRef) {}

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
          text: 'Nuevo Usuario',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.cargarUsuarios();
    this.cargarRoles();
  }

  mostrarModalEditar(usuario: Usuario) {
    this.modalTitle = 'Editar Usuario';
    this.enNuevo = false;
    this.usuarioOriginal = usuario;
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(usuario));

    this.changeDetectionRef.detectChanges();
  }

  mostrarModalEliminar(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const usuarioAEnviar = new Usuario();
      Object.assign(usuarioAEnviar, this.usuarioSeleccionado);
      setTimeout(() => { this.cerrar(); f.form.reset(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.userService.create(usuarioAEnviar).subscribe(
          user => {
            if (user.roles[0] !== undefined) {
              user.rol_a_mostrar = user.roles[0].display_name;
            }
            this.usuarios.push(user);
            this.recargarTabla();
          },
          error => {
            let mensaje = '';
            const json = error.json()['error'];
            for (const key in json) {
              if (json.hasOwnProperty(key)) {
                mensaje = mensaje === '' ? json[key] : mensaje + '\n' + json[key];
              }
            }
            this.alertService.error(mensaje);
          }
        );
      } else {
        this.userService.update(usuarioAEnviar).subscribe(
          user => {
            if (user.roles[0] !== undefined) {
              user.rol_a_mostrar = user.roles[0].display_name;
            }
            Object.assign(this.usuarioOriginal, user);
          },
          error => {
            let mensaje = '';
            const json = error.json()['error'];
            for (const key in json) {
              if (json.hasOwnProperty(key)) {
                mensaje = mensaje === '' ? json[key] : mensaje + '\n' + json[key];
              }
            }
            this.alertService.error(mensaje);
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Usuario';
    this.enNuevo = true;
    this.usuarioSeleccionado = new Usuario;
    this.changeDetectionRef.detectChanges();
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.userService.delete(this.usuarioSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.usuarios.indexOf(this.usuarioSeleccionado);
        if (index !== -1) {
          this.usuarios.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
    this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  cargarUsuarios() {
    this.userService.getAll()
      .subscribe(json => {
        json.forEach( user => {
          if (user.roles[0] !== undefined) {
            user.rol_a_mostrar = user.roles[0].display_name;
          }
        });
        this.usuarios = json;
        this.dtTrigger.next();
      });
  }

  cargarRoles() {
    this.apiService.get('roles').subscribe( json => {
      this.roles = json;
    });
  }
}
