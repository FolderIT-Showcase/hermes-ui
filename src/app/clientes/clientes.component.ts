import {Component, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Cliente} from 'domain/cliente';
import {ApiService} from '../../service/api.service';
import {DataTableDirective} from 'angular-datatables';
import {Localidad} from '../../domain/localidad';
import {Provincia} from 'domain/provincia';
import {AlertService} from '../../service/alert.service';
import {Domicilio} from '../../domain/domicilio';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
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
  constructor(private apiService: ApiService, private alertService: AlertService) {

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
      }
    };

    this.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'RNI', nombre: 'Responsable No Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'M', nombre: 'Monotributista'},
      {clave: 'SNC', nombre: 'Sujeto No Categorizado'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'},
      {clave: 'L', nombre: 'Liberado Ley 19640'},
      {clave: 'AP', nombre: 'Agente de Percepción'},
      {clave: 'CE', nombre: 'Contribuyente eventual'},
      {clave: 'MS', nombre: 'Monotributista Social'},
      {clave: 'CES', nombre: 'Contribuyente Eventual Social'},
      ];

    this.apiService.get('clientes')
      .subscribe(json => {
        this.clientes = json;
        this.clientes.forEach(
          cliente => {
            cliente.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === cliente.tipo_responsable).nombre;
          });
        this.dtTrigger.next();
        setTimeout(() => { this.mostrarTabla = true; }, 100);
      });
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Cliente';
    this.enNuevo = true;
    this.clienteSeleccionado = new Cliente;
    this.clienteSeleccionado.domicilios = [];
    this.clienteSeleccionado.tipo_responsable = 'RI';
    this.clienteSeleccionado.activo = true;
  }

  mostrarModalEditar(cliente: Cliente) {
    this.modalTitle = 'Editar Cliente';
    this.enNuevo = false;
    this.clienteOriginal = cliente;
    this.clienteSeleccionado = JSON.parse(JSON.stringify(cliente));

    if (this.provincias.length === 0) {
      this.apiService.get('provincias').subscribe(
        json => {
          this.provincias = json;
        }
      );
    }

    this.localidades = [];
    // TODO mostrar 'cargando' mientras se cargan las localidades
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

  mostrarModalEliminar(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

  editarONuevo(f: any) {
    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('clientes', this.clienteSeleccionado).subscribe(
        json => {
          this.clientes.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('clientes/' + this.clienteSeleccionado.id, this.clienteSeleccionado).subscribe(
        json => {
          Object.assign(this.clienteOriginal, json);
          this.clienteOriginal.tipo_responsable_str = this.tipos_responsable.find(x => x.clave === this.clienteOriginal.tipo_responsable).nombre;
          f.form.reset();
        }
      );
    }
  }

  eliminar() {
    const index: number = this.clientes.indexOf(this.clienteSeleccionado);
    if (index !== -1) {
      this.clientes.splice(index, 1);
    }
    this.recargarTabla();
    this.apiService.delete('clientes/' + this.clienteSeleccionado.id).subscribe();

  }

  private recargarTabla() {
// TODO buscar otra forma de reflejar los cambios en la tabla
    this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 100);
    });
  }

  nuevoDomicilio() {
    this.clienteSeleccionado.domicilios.push(new Domicilio);
  }

  eliminarDomicilio(domiciliio: Domicilio) {
    const index: number = this.clienteSeleccionado.domicilios.indexOf(domiciliio);
    if (index !== -1) {
      this.clienteSeleccionado.domicilios.splice(index, 1);
    }
  }

  cargarLocalidades(provinciaId: number) {
    this.apiService.get('provincias/' + provinciaId).subscribe(
      json => {
        this.localidades = json.localidades;
      }
    );
  }
}
