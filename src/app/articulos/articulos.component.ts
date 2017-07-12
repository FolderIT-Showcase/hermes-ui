import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Articulo } from 'domain/articulo';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { Marca } from 'domain/marca';
import { Subrubro } from 'domain/subrubro';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit, OnDestroy {
  mostrarBarraCarga = true;
  enNuevo: boolean;
  articuloOriginal: Articulo;
  dtOptions: any = {};
  articulos: Articulo[] = [];
  dtTrigger: Subject<any> = new Subject();
  articuloSeleccionado: Articulo = new Articulo();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  marcas: Marca[] = [];
  subrubros: Subrubro[] = [];
  submitted = false;
  constructor(private apiService: ApiService) {}

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
          text: 'Nuevo Artículo',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };

    this.apiService.get('articulos')
      .subscribe(json => {
          this.articulos = json;
          this.cargarMarcas();
          this.cargarSubrubros();
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });

  }

  mostrarModalEditar(articulo: Articulo) {
    this.modalTitle = 'Editar Artículo';
    this.enNuevo = false;
    this.articuloOriginal = articulo;
    this.articuloSeleccionado = JSON.parse(JSON.stringify(articulo));
  }

  mostrarModalEliminar(articulo: Articulo) {
    this.articuloSeleccionado = articulo;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      // Máscara para mostrar siempre 2 decimales
      const num = this.articuloSeleccionado.costo;
      this.articuloSeleccionado.costo = !isNaN(+num) ? (+num).toFixed(2) : num;

      const articuloAEnviar = new Articulo();
      Object.assign(articuloAEnviar, this.articuloSeleccionado);
      setTimeout(() => { this.cerrar(f); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('articulos', articuloAEnviar).subscribe(
          json => {
            json.subrubro_nombre = this.subrubros.find(x => x.id === json.subrubro_id).nombre;
            json.marca_nombre = this.marcas.find(x => x.id === json.marca_id).nombre;
            this.articulos.push(json);
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('articulos/' + articuloAEnviar.id, articuloAEnviar).subscribe(
          json => {
            json.subrubro_nombre = this.subrubros.find(x => x.id === json.subrubro_id).nombre;
            json.marca_nombre = this.marcas.find(x => x.id === json.marca_id).nombre;
            Object.assign(this.articuloOriginal, json);
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nuevo Artículo';
    this.enNuevo = true;
    this.articuloSeleccionado = new Articulo;
    (<any>$('#modalEditar')).modal('show');
  }

  eliminar() {
    this.submitted = false;
    const index: number = this.articulos.indexOf(this.articuloSeleccionado);
    if (index !== -1) {
      this.articulos.splice(index, 1);
    }
    this.recargarTabla();
    this.apiService.delete('articulos/' + this.articuloSeleccionado.id).subscribe();
  }

  cerrar(f: any) {
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 100);
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

  cargarSubrubros() {
    if (this.subrubros.length === 0) {
      this.apiService.get('subrubros').subscribe(
        json => {
          this.subrubros = json;
          this.articulos.forEach(element => {
            element.subrubro_nombre = this.subrubros.find(x => x.id === element.subrubro_id).nombre;
          });
        }
      );
    }
  }

  cargarMarcas() {
    if (this.marcas.length === 0) {
      this.apiService.get('marcas').subscribe(
        json => {
          this.marcas = json;
          this.articulos.forEach(element => {
            element.marca_nombre = this.marcas.find(x => x.id === element.marca_id).nombre;
          });
        }
      );
    }
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
    (<any>$('#modalEliminar')).modal('hide');
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
