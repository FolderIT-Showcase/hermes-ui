import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {ListaPrecios} from '../../domain/listaPrecios';
import {Articulo} from '../../domain/articulo';
import {isNullOrUndefined} from 'util';
import {ItemListaPrecios} from '../../domain/itemListaPrecios';
import {Subrubro} from '../../domain/subrubro';
import {Rubro} from '../../domain/rubro';
import {Marca} from '../../domain/marca';

@Component({
  selector: 'app-lista-precios',
  templateUrl: './listaPrecios.component.html',
  styleUrls: ['./listaPrecios.component.css']
})
export class ListaPreciosComponent implements OnInit, OnDestroy {

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
  articulos: Articulo[];
  articulosAMostrar: Articulo[];
  busquedaArticuloRubroId: number;
  busquedaArticuloSubrubroId: number;
  busquedaArticuloMarcaId: number;
  subrubros: Subrubro[];
  subrubrosAMostrar: Subrubro[];
  rubros: Rubro[];
  marcas: Marca[];
  submitted = false;
  accionActualizar: String;
  actualizarPor: String;
  valorActualizacion = 0;
  actualizarDescripcion: boolean;
  actualizarPrecioCosto: boolean;
  actualizarPrecioVenta: boolean;
  campoCodigoAUtilizar: String;
  archivo: any;
  formImportarSubmitted = false;
  articulosNoEncontrados: Articulo[];
  private rubroId = 0;
  private subrubroId = 0;
  private marcaId = 0;
  file: any;
  constructor(private apiService: ApiService, private alertService: AlertService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
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
      },
        {
          'targets': -2,
          'searchable': false,
          'orderable': false
        }],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nueva Lista de Precios',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        },
        {
          text: 'Importar',
          key: '2',
          className: 'btn btn-default',
          action: () => {
            this.mostrarModalImportar();
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
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      // Máscara para mostrar siempre 2 decimales
      const num = this.listaPreciosSeleccionada.porcentaje;
      this.listaPreciosSeleccionada.porcentaje = !isNaN(+num) ? (+num).toFixed(2) : num;

      const listaPreciosAEnviar = new ListaPrecios();
      Object.assign(listaPreciosAEnviar, this.listaPreciosSeleccionada);
      setTimeout(() => {
        this.cerrar(f);
      }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('listaprecios', listaPreciosAEnviar).subscribe(
          json => {
            this.listasPrecios.push(json);
            this.recargarTabla();
          }
        );
      } else {
        this.apiService.put('listaprecios/' + listaPreciosAEnviar.id, listaPreciosAEnviar).subscribe(
          json => {
            Object.assign(this.listaPreciosOriginal, json);
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nueva Lista de Precios';
    this.enNuevo = true;
    this.listaPreciosSeleccionada = new ListaPrecios;
    this.listaPreciosSeleccionada.activo = true;
    this.listaPreciosSeleccionada.lista_precio_item = [];
    (<any>$('#modalEditar')).modal('show');
  }

  mostrarModalImportar() {
    this.actualizarDescripcion = true;
    this.actualizarPrecioCosto = true;
    this.actualizarPrecioVenta = false;
    this.campoCodigoAUtilizar = 'codigo';
    this.formImportarSubmitted = false;
    this.articulosNoEncontrados = [];
    (<any>$('#modalImportar')).modal('show');
  }

  cerrar(f) {
    this.submitted = false;
    if (!isNullOrUndefined(f)) {
      setTimeout(() => {  f.form.reset(); }, 100);
    }
  }

  eliminar() {
    this.submitted = false;
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

  mostrarModalItems(lista) {
    this.cargarSubrubros();
    this.cargarRubros();
    this.cargarMarcas();
    this.listaPreciosOriginal = lista;
    this.listaPreciosSeleccionada = JSON.parse(JSON.stringify(lista));

    this.apiService.get('articulos').subscribe( json => {
      this.articulos = json;
      this.articulos.forEach( articulo => {
        if (this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === articulo.id)) {
          articulo.enlista = true;
        }
      });
      this.articulosAMostrar = this.articulos;
    });
  }

  editarItems() {
    this.articulos.forEach( articulo => {
      if (articulo.enlista) {
        let item = this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === articulo.id);
        if (isNullOrUndefined(item)) {
          item = new ItemListaPrecios;
          item.articulo_id = articulo.id;
          item.lista_id = this.listaPreciosSeleccionada.id;
          this.listaPreciosSeleccionada.lista_precio_item.push(item);
        }
        item.precio_costo = +articulo.costo;
        item.precio_venta = +articulo.costo * (1 + +this.listaPreciosSeleccionada.porcentaje / 100);
      } else {
        const item = this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === articulo.id);
        if (!isNullOrUndefined(item)) {
          const index: number = this.listaPreciosSeleccionada.lista_precio_item.indexOf(item);
          if (index !== -1) {
            this.listaPreciosSeleccionada.lista_precio_item.splice(index, 1);
          }
        }
      }
    });

    const listaPreciosAEnviar = new ListaPrecios();
    Object.assign(listaPreciosAEnviar, this.listaPreciosSeleccionada);
    this.cerrar(null);

    this.apiService.put('listaprecios/' + listaPreciosAEnviar.id, listaPreciosAEnviar).subscribe( json => {
        Object.assign(this.listaPreciosOriginal, json);
      }
    );
  }

  toggleAll(value) {
    this.articulos.forEach( articulo => {
      articulo.enlista = value;
    });
  }

  cargarRubros() {
    this.apiService.get('rubros').subscribe( json => {
      this.rubros = json;
    });
  }

  cargarSubrubros() {
    this.apiService.get('subrubros').subscribe( json => {
      this.subrubros = json;
      this.subrubrosAMostrar = this.subrubros;
    });
  }

  cargarMarcas() {
    this.apiService.get('marcas').subscribe( json => {
      this.marcas = json;
    });
  }

  onMarcaChanged(value) {
    this.marcaId = +value;
    this.filtrarArticulos();
  }

  onRubroChanged(value) {
    this.rubroId = +value;
    if (+value !== 0) {
      this.subrubrosAMostrar = this.subrubros.filter(x => x.rubro_id === +value);
    } else {
      this.subrubrosAMostrar = this.subrubros;
    }
    this.filtrarArticulos();
  }

  onSubrubroChanged(value) {
    this.subrubroId = +value;
    this.filtrarArticulos();
  }

  filtrarArticulos() {
    this.articulosAMostrar = this.articulos;
    if (this.rubroId !== 0) {
      this.articulosAMostrar = this.articulosAMostrar.filter(articulo =>
        this.subrubros.find(subrubro => subrubro.id === articulo.subrubro_id).rubro_id === this.rubroId);
    }
    if (this.subrubroId !== 0) {
      this.articulosAMostrar = this.articulosAMostrar.filter(x => x.subrubro_id === this.subrubroId);
    }
    if (this.marcaId !== 0) {
      this.articulosAMostrar = this.articulosAMostrar.filter(x => x.marca_id === this.marcaId);
    }
  }

  mostrarModalActualizarPrecios(lista: ListaPrecios) {
    this.listaPreciosOriginal = lista;
    this.listaPreciosSeleccionada = JSON.parse(JSON.stringify(lista));
    this.accionActualizar = 'aumentar';
    this.actualizarPor = 'porcentaje';
    this.valorActualizacion = 0;
  }

  actualizarPrecios() {
    (<any>$('#modalConfirmarActualizarPrecios')).modal('show');

    this.apiService.get('articulos').subscribe( json => {
      this.articulos = json;
      this.articulos = this.articulos.filter( articulo => {
        return !isNullOrUndefined(this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === articulo.id));
      });
      this.articulos.forEach( articulo => {
        articulo.precio_venta = (this.listaPreciosSeleccionada.lista_precio_item.find(x => x.articulo_id === articulo.id)).precio_venta;
      });
      this.articulos.forEach( articulo => {
        switch (this.actualizarPor) {
          case 'importe':
            articulo.nuevo_precio_venta = +articulo.precio_venta +
              +(this.valorActualizacion * (this.accionActualizar === 'aumentar' ? 1 : -1));
            break;
          case 'porcentaje': default:
            articulo.nuevo_precio_venta = +articulo.precio_venta *
              +(1 + (this.valorActualizacion * (this.accionActualizar === 'aumentar' ? 1 : -1)) / 100);
            break;
        }
        articulo.nuevo_precio_venta = articulo.nuevo_precio_venta.toFixed(2);
      });
    });
  }

  confirmarActualizarPrecios() {
    this.articulos.forEach( articulo => {
      this.listaPreciosSeleccionada.lista_precio_item.find( x => x.articulo_id === articulo.id).precio_venta = +articulo.nuevo_precio_venta;
    });
    const listaPreciosAEnviar = new ListaPrecios();
    Object.assign(listaPreciosAEnviar, this.listaPreciosSeleccionada);
    this.cerrar(null);

    this.apiService.put('listaprecios/' + listaPreciosAEnviar.id, listaPreciosAEnviar).subscribe( json => {
        Object.assign(this.listaPreciosOriginal, json);
      }
    );
  }

  importarListaPrecios() {
    this.formImportarSubmitted = true;
    if (!isNullOrUndefined(this.file)) {
      const body = {
        actualizarDescripcion: this.actualizarDescripcion,
        actualizarPrecioCosto: this.actualizarPrecioCosto,
        actualizarPrecioVenta: this.actualizarPrecioVenta,
        campoCodigoAUtilizar: this.campoCodigoAUtilizar
      };
      (<any>$('#modalImportar')).modal('hide');
      this.apiService.postWithFile('listaprecios/importar', body, this.file).subscribe( json => {
        this.articulosNoEncontrados = json.no_encontrados;
        if (this.articulosNoEncontrados.length !== 0) {
          (<any>$('#modalNoEncontrados')).modal('show');
        }
      });
    }
  }

  onChangeFile(file) {
    this.file = file[0];
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalEditar')).modal('hide');
    (<any>$('#modalEliminar')).modal('hide');
    (<any>$('#modalItems')).modal('hide');
    (<any>$('#modalActualizarPrecios')).modal('hide');
    (<any>$('#modalConfirmarActualizarPrecios')).modal('hide');
    (<any>$('#modalNoEncontrados')).modal('hide');
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
