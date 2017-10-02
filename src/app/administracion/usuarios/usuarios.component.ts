import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { User as Usuario} from '../../shared/domain/user';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../shared/services/api.service';
import { AlertService } from '../../shared/services/alert.service';
import { Rubro } from '../../shared/domain/rubro';
import {UserService} from '../../shared/services/user.service';
import {TitleService} from '../../shared/services/title.service';
import {HelperService} from '../../shared/services/helper.service';
import {Rol} from '../../shared/domain/rol';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {

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
  roles: Rol[] = [];
  mostrarBarraCarga = true;
  passwordNoCoincide = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private userService: UserService,
              private changeDetectionRef: ChangeDetectorRef,
              private titleService: TitleService) {}

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
          text: 'Nuevo Usuario',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.titleService.setTitle('Gestión de Usuarios');
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
    if (f.valid && !this.passwordNoCoincide) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const usuarioAEnviar = new Usuario();
      Object.assign(usuarioAEnviar, this.usuarioSeleccionado);
      setTimeout(() => { this.cerrar(); f.form.reset(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.subscriptions.add(this.userService.create(usuarioAEnviar).subscribe(
          user => {
            if (user.roles[0] !== undefined) {
              user.rol_a_mostrar = user.roles[0].display_name;
            }
            this.usuarios.push(user);
            this.recargarTabla();
          },
          error => {
            this.handleError(error);
          }
        ));
      } else {
        this.subscriptions.add(this.userService.update(usuarioAEnviar).subscribe(
          user => {
            if (user.roles[0] !== undefined) {
              user.rol_a_mostrar = user.roles[0].display_name;
            }
            Object.assign(this.usuarioOriginal, user);
          },
          error => {
            this.handleError(error);
          }
        ));
      }
    }
  }

  private handleError(error) {
    let mensaje = '';
    const json = error.json()['error'];
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        mensaje = mensaje === '' ? json[key] : mensaje + '\n' + json[key];
      }
    }
    this.alertService.error(mensaje);
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
    this.subscriptions.add(this.userService.delete(this.usuarioSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.usuarios.indexOf(this.usuarioSeleccionado);
        if (index !== -1) {
          this.usuarios.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    }));
  }

  private recargarTabla() {
    // this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  cargarUsuarios() {
    this.subscriptions.add(this.userService.getAll()
      .subscribe(json => {
        json.forEach( user => {
          if (user.roles[0] !== undefined) {
            user.rol_a_mostrar = user.roles[0].display_name;
            user.rol_id = user.roles[0].id;
          }
        });
        this.usuarios = json;
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
      }));
  }

  cargarRoles() {
    this.subscriptions.add(this.apiService.get('roles').subscribe( json => {
      this.roles = json;
    }));
  }

  onPasswordChange(event) {
    this.usuarioSeleccionado.password = event;
    this.passwordNoCoincide = this.usuarioSeleccionado.password !== this.usuarioSeleccionado.repassword;
  }

  onRepasswordChange(event) {
    this.usuarioSeleccionado.repassword = event;
    this.passwordNoCoincide = this.usuarioSeleccionado.password !== this.usuarioSeleccionado.repassword;
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
    (<any>$('#modalEliminar')).modal('hide');
  }

  ngOnDestroy() {
    this.ocultarModals();
    this.subscriptions.unsubscribe();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
