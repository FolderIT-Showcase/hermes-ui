import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Tarjeta} from '../../../domain/tarjeta';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {NavbarTitleService} from '../../../service/navbar-title.service';
import {Cliente} from '../../../domain/cliente';
import {TipoTarjeta} from '../../../domain/tipoTarjeta';
import {IMyDpOptions} from 'mydatepicker';

@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrls: ['./tarjetas.component.css']
})
export class TarjetasComponent implements OnInit, OnDestroy {
  @Input() filter: any;
  enNuevo: boolean;
  clientes: Cliente[] = [];
  tipos: TipoTarjeta[] = [];
  tarjetaOriginal: Tarjeta;
  dtOptions: any = {};
  tarjetas: Tarjeta[] = [];
  dtTrigger: Subject<any> = new Subject();
  tarjetaSeleccionada: Tarjeta = new Tarjeta();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  modalTitle: string;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
  myDatePickerOptions: IMyDpOptions;
  constructor(private apiService: ApiService,
              private alertService: AlertService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 12,
      scrollY: '63.5vh',
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
        'orderable': false,
        'width': '5%'
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: 'Nueva Tarjeta',
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.apiService.get('tarjetas/buscar', this.filter)
      .subscribe(json => {
          this.tarjetas = json;
          this.cargarClientes();
          this.cargarTipos();
          this.mostrarBarraCarga = false;
          this.mostrarTabla = true;
          this.dtTrigger.next();
        },
        () => {
          this.mostrarBarraCarga = false;
        });

    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
      dayLabels: {su: 'Dom', mo: 'Lun', tu: 'Mar', we: 'Mié', th: 'Jue', fr: 'Vie', sa: 'Sáb'},
      monthLabels: {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
        7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'},
      todayBtnTxt: 'Hoy',
      showClearDateBtn: false,
      editableDateField: false,
      openSelectorOnInputClick: true,
      alignSelectorRight: true,
    };
  }

  mostrarModalEditar(tarjeta: Tarjeta) {
    this.modalTitle = 'Editar Tarjeta';
    this.enNuevo = false;
    this.tarjetaOriginal = tarjeta;
    this.tarjetaSeleccionada = JSON.parse(JSON.stringify(tarjeta));

    let month = this.tarjetaSeleccionada.fecha.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.tarjetaSeleccionada.fecha.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.tarjetaSeleccionada.fecha =  {
      date: {
        year: this.tarjetaSeleccionada.fecha.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    month = this.tarjetaSeleccionada.fecha_acreditacion.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    day = this.tarjetaSeleccionada.fecha_acreditacion.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.tarjetaSeleccionada.fecha_acreditacion =  {
      date: {
        year: this.tarjetaSeleccionada.fecha_acreditacion.toString().slice(0, 4),
        month: month,
        day: day
      }
    };
  }

  mostrarModalEliminar(tarjeta: Tarjeta) {
    this.tarjetaSeleccionada = tarjeta;
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      (<any>$('#modalEditar')).modal('hide');
      const tarjetaAEnviar = new Tarjeta();
      Object.assign(tarjetaAEnviar, this.tarjetaSeleccionada);
      tarjetaAEnviar.fecha = tarjetaAEnviar.fecha.date.year + '-' + tarjetaAEnviar.fecha.date.month + '-' + tarjetaAEnviar.fecha.date.day;
      tarjetaAEnviar.fecha_acreditacion = tarjetaAEnviar.fecha_acreditacion.date.year + '-' + tarjetaAEnviar.fecha_acreditacion.date.month + '-' + tarjetaAEnviar.fecha_acreditacion.date.day;
      setTimeout(() => { this.cerrar(); }, 100);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('tarjetas', tarjetaAEnviar).subscribe(
          json => {
            json.tarjeta_nombre = this.tipos.find(x => x.id === json.tarjeta_id).nombre;
            json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            this.tarjetas.push(json);
            this.recargarTabla();
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('tarjetas/' + tarjetaAEnviar.id, tarjetaAEnviar).subscribe(
          json => {
            json.tarjeta_nombre = this.tipos.find(x => x.id === json.tarjeta_id).nombre;
            json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            Object.assign(this.tarjetaOriginal, json);
            f.form.reset();
          }
        );
      }
    }
  }

  mostrarModalNuevo() {
    this.modalTitle = 'Nueva Tarjeta';
    this.enNuevo = true;
    this.tarjetaSeleccionada = new Tarjeta;
    const today = new Date();
    this.tarjetaSeleccionada.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.tarjetaSeleccionada.fecha_acreditacion =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    (<any>$('#modalEditar')).modal('show');
  }

  cerrar() {
    this.submitted = false;
  }

  eliminar() {
    this.submitted = false;
    this.apiService.delete('tarjetas/' + this.tarjetaSeleccionada.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.tarjetas.indexOf(this.tarjetaSeleccionada);
        if (index !== -1) {
          this.tarjetas.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    });
  }

  private recargarTabla() {
//     this.mostrarTabla = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  cargarClientes() {
    if (this.clientes.length === 0) {
      this.apiService.get('clientes').subscribe(
        json => {
          this.clientes = json;
          this.tarjetas.forEach(element => {
            element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
          });
        }
      );
    }
  }

  cargarTipos() {
    if (this.tipos.length === 0) {
      this.apiService.get('tipostarjeta').subscribe(
        json => {
          this.tipos = json;
          this.tarjetas.forEach(element => {
            element.tarjeta_nombre = this.tipos.find(x => x.id === element.tarjeta_id).nombre;
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
