import { Component, OnInit, ViewChild } from '@angular/core';
import { Zona } from 'domain/zona';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
})
export class ZonasComponent implements OnInit {

  enNuevo: boolean;
  zonaOriginal: Zona;
  dtOptions: any = {};
  zonas: Zona[] = [];
  dtTrigger: Subject<any> = new Subject();
  zonaSeleccionada: Zona = new Zona();
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
          text: 'Nueva Zona',
          key: '1',
          className: 'btn btn-success a-override',
          action: function (e, dt, node, config) {
            $('#modalEditar').modal('show');
          }
        }
      ]
    };
  setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('zonas')
      .subscribe(json => {
        this.zonas = json;
        this.dtTrigger.next();
      });
    this.reestablecerParaNuevo();
  }

  mostrarModalEditar(zona: Zona) {
    this.modalTitle = 'Editar Zona';
    this.enNuevo = false;
    this.zonaOriginal = zona;
    this.zonaSeleccionada = JSON.parse(JSON.stringify(zona));
  }

  mostrarModalEliminar(zona: Zona) {
    this.zonaSeleccionada = zona;
  }

  editarONuevo(f: any) {
    const zonaAEnviar = new Zona();
    Object.assign(zonaAEnviar, this.zonaSeleccionada);
    setTimeout(() => { this.cerrar(); }, 100);

    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('zonas', zonaAEnviar).subscribe(
        json => {
          this.zonas.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('zonas/' + zonaAEnviar, zonaAEnviar).subscribe(
        json => {
          Object.assign(this.zonaOriginal, json);
          f.form.reset();
        }
      );
    }
  }

  reestablecerParaNuevo() {
    this.modalTitle = 'Nueva Zona';
    this.enNuevo = true;
    this.zonaSeleccionada = new Zona;
  }

  cerrar() {
    this.reestablecerParaNuevo();
  }

  eliminar() {
    this.apiService.delete('zonas/' + this.zonaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.zonas.indexOf(this.zonaSeleccionada);
        if (index !== -1) {
          this.zonas.splice(index, 1);
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
