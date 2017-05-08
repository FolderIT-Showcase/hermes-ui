import { Component, OnInit, ViewChild } from '@angular/core';
import { Marca } from 'domain/marca';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {

  enNuevo: boolean;
  marcaOriginal: Marca;
  dtOptions: any = {};
  marcas: Marca[] = [];
  dtTrigger: Subject<any> = new Subject();
  marcaSeleccionada: Marca = new Marca();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  constructor(private apiService: ApiService, private alertService: AlertService) {}

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
    } ]
    };

    this.apiService.get('marcas')
      .subscribe(json => {
        this.marcas = json;
        this.dtTrigger.next();
        setTimeout(() => { this.mostrarTabla = true; }, 1000);
      });
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nueva Marca';
    this.enNuevo = true;
    this.marcaSeleccionada = new Marca;
  }

  mostrarModalEditar(marca: Marca) {
    this.modalTitle = 'Editar Marca';
    this.enNuevo = false;
    this.marcaOriginal = marca;
    this.marcaSeleccionada = JSON.parse(JSON.stringify(marca));
  }

  mostrarModalEliminar(marca: Marca) {
    this.marcaSeleccionada = marca;
  }

  editarONuevo(f: any) {
    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('marcas', this.marcaSeleccionada).subscribe(
        json => {
          this.marcas.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('marcas/' + this.marcaSeleccionada.id, this.marcaSeleccionada).subscribe(
        json => {
          Object.assign(this.marcaOriginal, json);
          f.form.reset();
        }
      );
    }
  }

  eliminar() {

    this.apiService.delete('marcas/' + this.marcaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.marcas.indexOf(this.marcaSeleccionada);
        if (index !== -1) {
          this.marcas.splice(index, 1);
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
      setTimeout(() => { this.mostrarTabla = true; }, 1000);
    });
  }
}