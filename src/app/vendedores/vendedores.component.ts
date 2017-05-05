import { Component, OnInit, ViewChild } from '@angular/core';
import { Vendedor } from 'domain/vendedor';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import { Zona } from 'domain/zona';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.css']
})
export class VendedoresComponent implements OnInit {

  enNuevo: boolean;
  vendedorOriginal: Vendedor;
  dtOptions: any = {};
  vendedores: Vendedor[] = [];
  dtTrigger: Subject<any> = new Subject();
  vendedorSeleccionado: Vendedor = new Vendedor();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  zonas: any;
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

    this.apiService.get('vendedores')
      .subscribe(json => {
        this.vendedores = json;
        this.dtTrigger.next();
        setTimeout(() => { this.mostrarTabla = true; }, 1000);
      });
    this.cargarZonas();
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Vendedor';
    this.enNuevo = true;
    this.vendedorSeleccionado = new Vendedor;
  }

  mostrarModalEditar(vendedor: Vendedor) {
    this.modalTitle = 'Editar Vendedor';
    this.enNuevo = false;
    this.vendedorOriginal = vendedor;
    this.vendedorSeleccionado = JSON.parse(JSON.stringify(vendedor));
    this.cargarZonas();
  }

  mostrarModalEliminar(vendedor: Vendedor) {
    this.vendedorSeleccionado = vendedor;
  }

  editarONuevo(f: any) {
    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('vendedores', this.vendedorSeleccionado).subscribe(
        json => {
          this.vendedores.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('vendedores/' + this.vendedorSeleccionado.id, this.vendedorSeleccionado).subscribe(
        json => {
          Object.assign(this.vendedorOriginal, json);
          f.form.reset();
        }
      );
    }
  }

  eliminar() {
    const index: number = this.vendedores.indexOf(this.vendedorSeleccionado);
    if (index !== -1) {
      this.vendedores.splice(index, 1);
    }
    this.recargarTabla();
    this.apiService.delete('vendedores/' + this.vendedorSeleccionado.id).subscribe();
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

  cargarZonas() {
      this.apiService.get('zonas').subscribe(
        json => {
          this.zonas = json;
        }
      );
  }
}
