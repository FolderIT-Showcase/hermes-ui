import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../service/api.service';
import {Comprobante} from '../../domain/comprobante';
import {TipoComprobante} from '../../domain/tipocomprobante';
import {AlertService} from '../../service/alert.service';
import {IMyDpOptions} from 'mydatepicker';

@Component({
  selector: 'app-impresion',
  templateUrl: './impresion.component.html',
  styleUrls: ['./impresion.component.css']
})
export class ImpresionComponent implements OnInit, AfterViewInit, OnDestroy {
  tipoComprobanteSeleccionadoId: number;
  comprobantes: Comprobante[];
  fechaInicio: any;
  fechaFin: any;
  fechaSeleccionada: false;
  comprobante: Comprobante;
  dtOptions: any;
  submitted = false;
  myDatePickerOptions: IMyDpOptions;
  tipos_comprobantes: TipoComprobante[];

  constructor(private apiService: ApiService, private alertService: AlertService) {}

  ngOnInit() {
    this.dtOptions = {
      language: {
        'processing':     'Procesando...',
        'lengthMenu':     'Mostrar _MENU_ registros',
        'zeroRecords':    '',
        'emptyTable':     '',
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
      dom: 'tp',
      scrollY: '350px',
      paging: false,
      columnDefs: [ {
        'targets': 0,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 1,
        'searchable': false,
        'orderable': false,
        'width': '15%'
      }, {
        'targets': 2,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 3,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 4,
        'searchable': false,
        'orderable': false,
        'width': '20%'
      }, {
        'targets': 5,
        'searchable': false,
        'orderable': false,
        'width': '10%'
      }]
    };

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
    };

    this.fechaSeleccionada = false;
    this.comprobantes = [];
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1, pastYear.getMonth(), pastYear.getDate());
    this.fechaInicio = { date: { year: pastYear.getFullYear(), month: pastYear.getMonth() + 1, day: pastYear.getDate() }};
    const today = new Date();
    this.fechaFin =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }};

    this.tipoComprobanteSeleccionadoId = 0;

    this.tipos_comprobantes = [];
    this.apiService.get('tipocomprobantes').subscribe( json => {
      this.tipos_comprobantes = json;
    });
  }

  ngAfterViewInit(): void {
  }

  filtrar() {
    this.submitted = true;

    if (!(this.rangoFechaInvalido() && this.fechaSeleccionada)) {
      let fechaInicioAEnviar = this.fechaInicio.date.year + '-'
        + this.fechaInicio.date.month
        + '-' + this.fechaInicio.date.day;
      const fechaFinAEnviar = this.fechaFin.date.year + '-' + this.fechaFin.date.month + '-' + this.fechaFin.date.day;
      if (!this.fechaSeleccionada) {
        const initialYear = new Date();
        initialYear.setTime(0);
        fechaInicioAEnviar =  initialYear.getFullYear() + '-' + (initialYear.getMonth() + 1) + '-' + initialYear.getDate();
      }

      this.apiService.get('comprobantes/buscar', {
        'tipo_comprobante': this.tipoComprobanteSeleccionadoId,
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
      }).subscribe( json => {
        this.comprobantes = json;
        this.comprobantes.forEach( comprobante => {
          comprobante.ptoventaynumero = ('000' + comprobante.punto_venta).slice(-4) + '-' + ('0000000' + comprobante.numero).slice(-8);
        });
        setTimeout(() => {$('#table').DataTable().columns.adjust(); }, 100);
      });
    }
  }

  cerrar() {
  }

  rangoFechaInvalido(): boolean {
    return (this.fechaInicio.date.year > this.fechaFin.date.year)
      ||  ((this.fechaInicio.date.year === this.fechaFin.date.year) &&
        (this.fechaInicio.date.month > this.fechaFin.date.month))
      || ((this.fechaInicio.date.year === this.fechaFin.date.year) &&
        (this.fechaInicio.date.month === this.fechaFin.date.month)
        && this.fechaInicio.date.day > this.fechaFin.date.day);
  }

  imprimirPDF(comprobante: Comprobante) {
    this.apiService.downloadPDF('comprobantes/imprimir/' + comprobante.id, {}).subscribe(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        try {
          const win = window.open(fileURL, '_blank');
          win.print();
        } catch (e) {
          this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
        }
      }
    );
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {}

  ngOnDestroy() {
    this.ocultarModals();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
