import { Component, OnInit, ViewChild } from '@angular/core';
import { Rubro } from 'domain/rubro';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-rubros',
  templateUrl: './rubros.component.html',
  styleUrls: ['./rubros.component.css']
})
export class RubrosComponent implements OnInit {

  enNuevo: boolean;
  rubroOriginal: Rubro;
  dtOptions: any = {};
  rubros: Rubro[] = [];
  dtTrigger: Subject<any> = new Subject();
  rubroSeleccionado: Rubro = new Rubro();
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
          text: 'Nuevo Rubro',
          key: '1',
          className: 'btn btn-success a-override',
          action: function (e, dt, node, config) {
            $('#modalEditar').modal('show');
          }
        }
      ]
    };

    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('rubros')
      .subscribe(json => {
        this.rubros = json;
        this.dtTrigger.next();
      });
    this.reestablecerParaNuevo();
  }

  mostrarModalNuevo() {

  }

  mostrarModalEditar(rubro: Rubro) {
    this.modalTitle = 'Editar Rubro';
    this.enNuevo = false;
    this.rubroOriginal = rubro;
    this.rubroSeleccionado = JSON.parse(JSON.stringify(rubro));
  }

  mostrarModalEliminar(rubro: Rubro) {
    this.rubroSeleccionado = rubro;
  }

  editarONuevo(f: any) {
    const rubroAEnviar = new Rubro();
    Object.assign(rubroAEnviar, this.rubroSeleccionado);
    setTimeout(() => { this.cerrar(); }, 100);

    if (this.enNuevo) {
      this.enNuevo = false;
      this.apiService.post('rubros', rubroAEnviar).subscribe(
        json => {
          this.rubros.push(json);
          this.recargarTabla();
          f.form.reset();
        }
      );
    } else {
      this.apiService.put('rubros/' + rubroAEnviar.id, rubroAEnviar).subscribe(
        json => {
          Object.assign(this.rubroOriginal, json);
          f.form.reset();
        }
      );
    }
  }

  reestablecerParaNuevo() {
    this.modalTitle = 'Nuevo Rubro';
    this.enNuevo = true;
    this.rubroSeleccionado = new Rubro;
  }

  cerrar() {
    this.reestablecerParaNuevo();
  }

  eliminar() {
    this.apiService.delete('rubros/' + this.rubroSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.rubros.indexOf(this.rubroSeleccionado);
        if (index !== -1) {
          this.rubros.splice(index, 1);
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
