import {
  AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Cliente} from 'domain/cliente';
import {ApiService} from '../../service/api.service';
import {DataTableDirective} from 'angular-datatables';
import {Localidad} from '../../domain/localidad';
import {Provincia} from 'domain/provincia';
import { Domicilio } from '../../domain/domicilio';
import { Vendedor } from 'domain/vendedor';
import { Zona } from 'domain/zona';
import {ListaPrecios} from '../../domain/listaPrecios';
import {isNullOrUndefined} from 'util';
import {TipoCategoriaCliente} from '../../domain/tipoCategoriaCliente';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';

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
  tipoCategoriaClientes: TipoCategoriaCliente[];
  submitted = false;

  // Reporte lista clientes
  parametroReporteFiltrarPorVendedor = false;
  parametroReporteVendedor: Number;
  parametroReporteFiltrarPorZona = false;
  parametroReporteZona: Number;
  parametroReporteFiltrarPorProvincia = false;
  parametroReporteProvincia: Number;
  parametroReporteFiltrarPorLocalidad = false;
  parametroReporteLocalidad: Number;
  parametroReporteSoloActivos: Number;
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

    this.apiService.get('clientes')
      .subscribe(json => {
          this.clientes = json;
          this.clientes.forEach(
            cliente => {
              cliente.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === cliente.tipo_responsable).nombre;
            });
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });
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
    this.clienteSeleccionado = cliente;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      const clienteAEnviar = new Cliente();
      Object.assign(clienteAEnviar, this.clienteSeleccionado);
      this.cerrar(f);
      (<any>$('#modalEditar')).modal('hide');
      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('clientes', clienteAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === clienteAEnviar.tipo_responsable).nombre;
            this.clientes.push(json);
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('clientes/' + clienteAEnviar.id, clienteAEnviar).subscribe(
          json => {
            json.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === clienteAEnviar.tipo_responsable).nombre;
            Object.assign(this.clienteOriginal, json);
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Cliente';
    this.enNuevo = true;
    this.clienteSeleccionado = new Cliente;
    this.clienteSeleccionado.domicilios = [];
    this.clienteSeleccionado.tipo_responsable = 'RI';
    this.clienteSeleccionado.activo = true;
    this.nuevoDomicilio();
    this.cargarProvincias();
    this.cargarVendedores();
    this.cargarZonas();
    this.cargarListasPrecios();
    this.cargarTipoCategoriaCliente();
    (<any>$('#modalEditar')).modal('show');
  }

  eliminar() {
    const index: number = this.clientes.indexOf(this.clienteSeleccionado);
    if (index !== -1) {
      this.clientes.splice(index, 1);
    }
    this.recargarTabla();
    this.apiService.delete('clientes/' + this.clienteSeleccionado.id).subscribe();
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
    this.mostrarTabla = false;
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
      this.apiService.get('provincias').subscribe(
        json => {
          this.provincias = json;
        }
      );
    }

    this.localidades = [];
    if (isNullOrUndefined(this.clienteSeleccionado)) {
      this.clienteSeleccionado.domicilios.forEach(
        domicilio => {
          this.apiService.get('localidades/' + domicilio.localidad_id).subscribe(
            json => {
              domicilio.provincia_id = json.provincia_id;
              this.cargarLocalidades(domicilio.provincia_id);
            }
          );
        }
      );
    }
  }

  cargarLocalidades(provinciaId: number) {
    this.apiService.get('provincias/' + provinciaId).subscribe(
      json => {
        this.localidades = json.localidades;
      }
    );
  }

  cargarVendedores() {
    if (this.vendedores.length === 0) {
      this.apiService.get('vendedores').subscribe(
        json => {
          this.vendedores = json;
        }
      );
    }
  }

  cargarZonas() {
    if (this.zonas.length === 0) {
      this.apiService.get('zonas').subscribe(
        json => {
          this.zonas = json;
        }
      );
    }
  }

  private cargarListasPrecios() {
    this.apiService.get('listaprecios').subscribe(json => {
      this.listasPrecios = json;
    });
  }

  onZonaChanged(value) {
    this.clienteSeleccionado.zona_id = +value;
    if (+this.clienteSeleccionado.zona_id === 0) {
      delete this.clienteSeleccionado.zona_id;
    }
  }

  onVendedorChanged(value) {
    this.clienteSeleccionado.vendedor_id = +value;
    if (+this.clienteSeleccionado.vendedor_id === 0) {
      delete this.clienteSeleccionado.vendedor_id;
    }
  }

  onListaPreciosChanged(value) {
    this.clienteSeleccionado.lista_id = +value;
    if (+this.clienteSeleccionado.lista_id === 0) {
      delete this.clienteSeleccionado.lista_id;
    }
  }

  onTipoCategoriaClienteChanged(value) {
    this.clienteSeleccionado.tipo_categoria = +value;
    if (+this.clienteSeleccionado.tipo_categoria === 0) {
      delete this.clienteSeleccionado.tipo_categoria;
    }
  }

  private cargarTipoCategoriaCliente() {
    this.apiService.get('tipocategoriaclientes').subscribe( json => {
      this.tipoCategoriaClientes = json;
    });
  }

  private mostrarModalReporte() {
    this.parametroReporteFiltrarPorVendedor = false;
    this.parametroReporteVendedor = 0;
    this.parametroReporteFiltrarPorZona = false;
    this.parametroReporteZona = 0;
    this.parametroReporteFiltrarPorProvincia = false;
    this.parametroReporteProvincia = 0;
    this.parametroReporteFiltrarPorLocalidad = false;
    this.parametroReporteLocalidad = 0;
    this.parametroReporteSoloActivos = 1;
    (<any>$('#modalReporte')).modal('show');
    this.clienteSeleccionado = new Cliente;
    this.cargarProvincias();
    this.cargarVendedores();
    this.cargarZonas();
  }

  onParametroReporteVendedorChanged(value) {
    this.parametroReporteVendedor = +value;
  }

  onParametroReporteZonaChanged(value) {
    this.parametroReporteZona = +value;
  }

  onParametroReporteProvinciaChanged(value) {
    this.parametroReporteProvincia = +value;
    this.parametroReporteLocalidad = 0;
    this.cargarLocalidades(value);
  }

  generarReporteClientes() {
    if (this.parametroReporteFiltrarPorVendedor === false) {
      this.parametroReporteVendedor = 0;
    }
    if (this.parametroReporteFiltrarPorZona === false) {
      this.parametroReporteZona = 0;
    }
    if (this.parametroReporteFiltrarPorProvincia === false) {
      this.parametroReporteProvincia = 0;
    }
    if (this.parametroReporteFiltrarPorLocalidad   === false) {
      this.parametroReporteLocalidad = 0;
    }

    this.apiService.downloadPDF('clientes/reporte', {
        'vendedor': this.parametroReporteVendedor,
        'zona': this.parametroReporteZona,
        'provincia': this.parametroReporteProvincia,
        'localidad': this.parametroReporteLocalidad,
        'activos': this.parametroReporteSoloActivos
      }
    ).subscribe(
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
