import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {ListaPrecios} from '../../domain/listaPrecios';

@Component({
  selector: 'app-lista-precios',
  templateUrl: './listaPrecios.component.html',
  styleUrls: ['./listaPrecios.component.css']
})
export class ListaPreciosComponent implements OnInit {

  enNuevo: boolean;
  listaPreciosOriginal: ListaPrecios;
  dtOptions: any = {};
  listasPrecios: ListaPrecios[] = [];
  dtTrigger: Subject<any> = new Subject();
  listaPreciosSeleccionada: ListaPrecios = new ListaPrecios();
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
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nueva Lista de Precios',
          key: '1',
          className: 'btn btn-success a-override',
          action: function (e, dt, node, config) {
            $('#modalEditar').modal('show');
          }
        }
      ]
    };
    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('listaprecios')
      .subscribe(json => {
        this.listasPrecios = json;
        this.dtTrigger.next();
      });
    this.reestablecerParaNuevo();
  }

  mostrarModalEditar(listaPrecios: ListaPrecios) {
    this.modalTitle = 'Editar Lista de Precios';
    this.enNuevo = false;
    this.listaPreciosOriginal = listaPrecios;
    this.listaPreciosSeleccionada = JSON.parse(JSON.stringify(listaPrecios));
  }

  mostrarModalEliminar(listaPrecios: ListaPrecios) {
    this.listaPreciosSeleccionada = listaPrecios;
  }

  editarONuevo(f: any) {
    // Máscara para mostrar siempre 2 decimales
    const num = this.listaPreciosSeleccionada.porcentaje;
    this.listaPreciosSeleccionada.porcentaje = !isNaN(+num) ? (+num).toFixed(2) : num;

    const listaPreciosAEnviar = new ListaPrecios();
    Object.assign(listaPreciosAEnviar, this.listaPreciosSeleccionada);
    setTimeout(() => { this.cerrar(); }, 100);

    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('listaprecios', listaPreciosAEnviar).subscribe(
        json => {
          this.listasPrecios.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('listaprecios/' + listaPreciosAEnviar.id, listaPreciosAEnviar).subscribe(
        json => {
          Object.assign(this.listaPreciosOriginal, json);
          f.form.reset();
        }
      );
    }
  }

  reestablecerParaNuevo() {
    this.modalTitle = 'Nueva Lista de Precios';
    this.enNuevo = true;
    this.listaPreciosSeleccionada = new ListaPrecios;
  }

  cerrar() {
    this.reestablecerParaNuevo();
  }

  eliminar() {
    this.apiService.delete('listaprecios/' + this.listaPreciosSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.listasPrecios.indexOf(this.listaPreciosSeleccionada);
        if (index !== -1) {
          this.listasPrecios.splice(index, 1);
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
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }
}
