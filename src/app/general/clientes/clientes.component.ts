import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Cliente} from 'app/shared/domain/cliente';
import {ApiService} from '../../shared/services/api.service';
import {DataTableDirective} from 'angular-datatables';
import {Localidad} from '../../shared/domain/localidad';
import {Provincia} from 'app/shared/domain/provincia';
import { Domicilio } from '../../shared/domain/domicilio';
import { Vendedor } from 'app/shared/domain/vendedor';
import { Zona } from 'app/shared/domain/zona';
import {ListaPrecios} from '../../shared/domain/listaPrecios';
import {isNullOrUndefined} from 'util';
import {TipoCategoriaCliente} from '../../shared/domain/tipoCategoriaCliente';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {HelperService} from '../../shared/services/helper.service';
import {ListadoClientesComponent} from './listado-clientes/listado-clientes.component';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, AfterViewChecked, OnDestroy {
  enNuevo: boolean;
  clienteOriginal: Cliente;
  dtOptions: any = {};
  clientes: Cliente[] = [];
  dtTrigger: Subject<any> = new Subject();
  clienteSeleccionado: Cliente = new Cliente();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  localidades: Localidad[] = [];
  provincias: Provincia[] = [];
  modalTitle: string;
  mostrarTabla = false;
  tipos_responsable = [];
  vendedores: Vendedor[] = [];
  zonas: Zona[] = [];
  listasPrecios: ListaPrecios[] = [];
  cuitmask = [/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/];
  telmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  celmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', '1', '5', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  tipoCategoriaClientes: TipoCategoriaCliente[] = [];
  submitted = false;
  mostrarBarraCarga = true;
  @ViewChild(ListadoClientesComponent)
  listadoClientesComponent: ListadoClientesComponent;
  private clienteAEliminar: Cliente;
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private cdRef: ChangeDetectorRef,
              private navbarTitleService: NavbarTitleService) {}

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

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
          text: 'Nuevo Cliente',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }, {
          text: 'Listado',
          key: '2',
          className: 'btn btn-default',
          action: () => {
            this.mostrarModalReporte();
          }
        }
      ]
    };
    this.navbarTitleService.setTitle('Gestión de Clientes');
    this.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'MON', nombre: 'Monotributista'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'}
    ];

    this.subscriptions.add(this.apiService.get('clientes')
      .subscribe(json => {
          this.clientes = json;
          this.clientes.forEach(
            cliente => {
              if (!isNullOrUndefined(this.tipos_responsable.find(x => x.clave === cliente.tipo_responsable))) {
                cliente.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === cliente.tipo_responsable).nombre;
              }
            });
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        }));
  }

  mostrarModalEditar(cliente: Cliente) {
    this.modalTitle = 'Editar Cliente';
    this.enNuevo = false;
    this.clienteOriginal = cliente;
    this.clienteSeleccionado = JSON.parse(JSON.stringify(cliente));
    this.cargarProvincias();
    this.cargarVendedores();
    this.cargarZonas();
    this.cargarListasPrecios();
    this.cargarTipoCategoriaCliente();
  }

  mostrarModalEliminar(cliente: Cliente) {
    this.clienteAEliminar = cliente;
  }

  mostrarModalReporte() {
    this.listadoClientesComponent.mostrarModalReporte();
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      const clienteAEnviar = new Cliente();
      Object.assign(clienteAEnviar, this.clienteSeleccionado);

      if (+clienteAEnviar.zona_id === 0) {
        clienteAEnviar.zona_id = null;
      }
      if (+clienteAEnviar.vendedor_id === 0) {
        clienteAEnviar.vendedor_id = null;
      }
      if (+clienteAEnviar.lista_id === 0) {
        clienteAEnviar.lista_id = null;
      }
      if (+clienteAEnviar.tipo_categoria_id === 0) {
        clienteAEnviar.tipo_categoria_id = null;
      }

      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.subscriptions.add(this.apiService.post('clientes', clienteAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === clienteAEnviar.tipo_responsable).nombre;
            this.clientes.push(json);
            this.recargarTabla();
          }
        ));
      } else {
        this.subscriptions.add(this.apiService.put('clientes/' + clienteAEnviar.id, clienteAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === clienteAEnviar.tipo_responsable).nombre;
            Object.assign(this.clienteOriginal, json);
          }
        ));
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Cliente';
    this.enNuevo = true;
    this.clienteSeleccionado = new Cliente;
    this.nuevoDomicilio();
    this.cargarProvincias();
    this.cargarVendedores();
    this.cargarZonas();
    this.cargarListasPrecios();
    this.cargarTipoCategoriaCliente();
    (<any>$('#modalEditar')).modal('show');
  }

  eliminar() {
    const index: number = this.clientes.indexOf(this.clienteAEliminar);
    if (index !== -1) {
      this.clientes.splice(index, 1);
    }
    this.recargarTabla();
    this.subscriptions.add(this.apiService.delete('clientes/' + this.clienteAEliminar.id).subscribe());
    this.cerrar(null);
  }

  cerrar(f) {
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 200);
    }
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

// TODO extraer todos los siguientes métodos en servicios
  nuevoDomicilio() {
    const domicilio = new Domicilio;
    domicilio.tipo = 'P';
    domicilio.localidad_id = 5878;
    domicilio.direccion = '';
    this.clienteSeleccionado.domicilios.push(domicilio);
  }

  /*  eliminarDomicilio(domiciliio: Domicilio) {
   const index: number = this.clienteSeleccionado.domicilios.indexOf(domiciliio);
   if (index !== -1) {
   this.clienteSeleccionado.domicilios.splice(index, 1);
   }
   }*/

  cargarProvincias() {
    if (this.provincias.length === 0) {
      this.subscriptions.add(this.apiService.get('provincias').subscribe(
        json => {
          this.provincias = json;
        }
      ));
    }

    this.localidades = [];
    if (!isNullOrUndefined(this.clienteSeleccionado) && !isNullOrUndefined(this.clienteSeleccionado.domicilios)) {
      this.clienteSeleccionado.domicilios.forEach(
        domicilio => {
          this.subscriptions.add(this.apiService.get('localidades/' + domicilio.localidad_id).subscribe(
            json => {
              domicilio.provincia_id = json.provincia_id;
              this.cargarLocalidades(domicilio.provincia_id);
            }
          ));
        }
      );
    }
  }

  cargarLocalidades(provinciaId: number) {
    this.subscriptions.add(this.apiService.get('provincias/' + provinciaId).subscribe(
      json => {
        this.localidades = json.localidades;
      }
    ));
  }

  cargarVendedores() {
    if (this.vendedores.length === 0) {
      this.subscriptions.add(this.apiService.get('vendedores').subscribe(
        json => {
          this.vendedores = json;
        }
      ));
    }
  }

  cargarZonas() {
    if (this.zonas.length === 0) {
      this.subscriptions.add(this.apiService.get('zonas').subscribe(
        json => {
          this.zonas = json;
        }
      ));
    }
  }

  private cargarListasPrecios() {
    if (this.listasPrecios.length === 0) {
      this.subscriptions.add(this.apiService.get('listaprecios').subscribe(json => {
        this.listasPrecios = json;
      }));
    }
  }

  private cargarTipoCategoriaCliente() {
    if (this.tipoCategoriaClientes.length === 0) {
      this.subscriptions.add(this.apiService.get('tipocategoriaclientes').subscribe(json => {
        this.tipoCategoriaClientes = json;
      }));
    }
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
    this.subscriptions.unsubscribe();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
