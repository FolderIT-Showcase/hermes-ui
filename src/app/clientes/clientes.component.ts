import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
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
import {CtaCteCliente} from '../../domain/ctaCteCliente';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, AfterViewChecked {
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
  parametroReporteFiltrarPorVendedor: Boolean;
  parametroReporteVendedor: Number;
  parametroReporteFiltrarPorZona: Boolean;
  parametroReporteZona: Number;
  parametroReporteFiltrarPorProvincia: Boolean;
  parametroReporteProvincia: Number;
  parametroReporteFiltrarPorLocalidad: Boolean;
  parametroReporteLocalidad: Number;
  parametroReporteSoloActivos: Number;

  // Cuenta Corriente
  clienteCtaCteSeleccionado: Cliente;
  fechaInicioCtaCte: Date | string;
  fechaFinCtaCte: Date | string;
  registrosCtaCte: CtaCteCliente[];
  fechaSeleccionadaCtaCte: false;
  clienteCtaCteAsync: string;
  clientesCtaCte: Cliente[];

  constructor(private apiService: ApiService, private cdRef: ChangeDetectorRef, private alertService: AlertService) {}

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
        }, {
          text: 'Cuenta Corriente',
          key: '3',
          className: 'btn btn-default',
          action: () => {
            this.mostrarModalCtaCte();
          }
        }
      ]
    };

    this.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'M', nombre: 'Monotributista'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'}
    ];
    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('clientes')
      .subscribe(json => {
        this.clientes = json;
        this.clientes.forEach(
          cliente => {
            cliente.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === cliente.tipo_responsable).nombre;
          });
        this.dtTrigger.next();
      });

    this.clientesCtaCte = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteCtaCteAsync).subscribe(json => {
        observer.next(json);
      });
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
      $('#modalEditar').modal('hide');
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
    $('#modalEditar').modal('show');
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
    $('#modalReporte').modal('show');
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

  mostrarModalCtaCte() {
    this.clienteCtaCteSeleccionado = new Cliente;
    this.fechaSeleccionadaCtaCte = false;
    this.fechaInicioCtaCte = new Date;
    this.fechaFinCtaCte = new Date;
    this.registrosCtaCte = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth() + 1, pastYear.getDate());
    this.fechaInicioCtaCte =  pastYear.getFullYear() + '-' + (pastYear.getMonth() + 1) + '-' + pastYear.getDate();
    const today = new Date();
    this.fechaFinCtaCte =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    $('#modalCtaCte').modal('show');
  }

  filtrarCtaCte() {
    let fechaInicioAEnviar = this.fechaInicioCtaCte;
    const fechaFinAEnviar = this.fechaFinCtaCte;
    if (!this.fechaSeleccionadaCtaCte) {
      const initialYear = new Date();
      initialYear.setTime(0);
      fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
    }

    this.apiService.get('cuentacorriente/buscar', {
      'cliente_id': this.clienteCtaCteSeleccionado.id,
      'fecha_inicio': fechaInicioAEnviar,
      'fecha_fin': fechaFinAEnviar,
    }).subscribe( json => {
      this.registrosCtaCte = json;
      let saldo = 0.0;
      this.registrosCtaCte.forEach( reg => {
        saldo += +reg.debe;
        saldo -= +reg.haber;
        reg.saldo = saldo.toFixed(2);
      });
    });
  }

  onClienteCtaCteChanged(event) {
    this.clienteCtaCteSeleccionado = event;
    this.clienteCtaCteAsync = this.clienteCtaCteSeleccionado.nombre;
  }

  imprimirReporteCtaCte() {
  }
}
