import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {Comprobante} from '../../domain/comprobante';

@Component({
  selector: 'app-presupuestos',
  templateUrl: './presupuestos.component.html',
  styleUrls: ['./presupuestos.component.css']
})
export class PresupuestosComponent implements OnInit {

  enNuevo: boolean;
  presupuestoOriginal: Comprobante;
  dtOptions: any = {};
  presupuestos: Comprobante[] = [];
  dtTrigger: Subject<any> = new Subject();
  presupuestoSeleccionado: Comprobante = new Comprobante();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  submitted = false;
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
          text: 'Nuevo Presupuesto',
          key: '1',
          className: 'btn btn-success a-override',
          action: function (e, dt, node, config) {
            $('#modalEditar').modal('show');
          }
        }
      ]
    };
    setTimeout(() => { this.mostrarTabla = true; }, 350);

    this.apiService.get('comprobantes/presupuestos')
      .subscribe(json => {
        this.presupuestos = json;
        this.dtTrigger.next();
      });
    this.reestablecerParaNuevo();
  }

  mostrarModalEditar(presupuesto: Comprobante) {
    this.modalTitle = 'Editar Presupuesto';
    this.enNuevo = false;
    this.presupuestoOriginal = presupuesto;
    this.presupuestoSeleccionado = JSON.parse(JSON.stringify(presupuesto));
  }

  mostrarModalEliminar(presupuesto: Comprobante) {
    this.presupuestoSeleccionado = presupuesto;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      $('#modalEditar').modal('hide');
      const presupuestoAEnviar = new Comprobante();
      Object.assign(presupuestoAEnviar, this.presupuestoSeleccionado);
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('presupuestos', presupuestoAEnviar).subscribe(
          json => {
            this.presupuestos.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('presupuestos/' + presupuestoAEnviar.id, presupuestoAEnviar).subscribe(
          json => {
            Object.assign(this.presupuestoOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  reestablecerParaNuevo() {
    this.modalTitle = 'Nueva Presupuesto';
    this.enNuevo = true;
    this.presupuestoSeleccionado = new Comprobante;
  }

  cerrar() {
    this.submitted = false;
    this.reestablecerParaNuevo();
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('presupuestos/' + this.presupuestoSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.presupuestos.indexOf(this.presupuestoSeleccionado);
        if (index !== -1) {
          this.presupuestos.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
      this.reestablecerParaNuevo();
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
