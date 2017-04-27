import {Component, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Cliente} from 'domain/cliente';
import {ApiService} from '../../service/api.service';
import {DataTableDirective} from 'angular-datatables';
import {Localidad} from '../../domain/localidad';
import {Provincia} from 'domain/provincia';

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
  constructor(private apiService: ApiService) { }

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
    const localidad1 = new Localidad();
    localidad1.nombre = 'Santa Fe';
    localidad1.id = 1;
    const localidad2 = new Localidad();
    localidad2.nombre = 'Santo Tome';
    localidad2.id = 2;
    this.localidades.push(localidad2);
    this.localidades.push(localidad1);
    const provincia = new Provincia();
    provincia.nombre = 'Santa Fe';
    this.provincias.push(provincia);
    this.apiService.get('clientes')
      .subscribe(json => {
        this.clientes = json;
        this.dtTrigger.next();
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
    this.clienteOriginal = cliente;
    this.clienteSeleccionado = JSON.parse(JSON.stringify(cliente));
  }

  mostrarModalEliminar(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

  editarONuevo() {
    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('clientes', this.clienteSeleccionado).subscribe(
        json => {
          console.log(json);
          this.clientes.push(json);
        }
      );
    } else {
      this.apiService.put('clientes/' + this.clienteSeleccionado.id, this.clienteSeleccionado).subscribe(
        json => {
          Object.assign(this.clienteOriginal, json);
        }
      );
    }
  }

  eliminar() {
    const index: number = this.clientes.indexOf(this.clienteSeleccionado);
    if (index !== -1) {
      this.clientes.splice(index, 1);
    }
    // TODO buscar otra forma de reflejar los cambios en la tabla
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
    this.apiService.delete('clientes/' + this.clienteSeleccionado.id).subscribe();

  }
}
