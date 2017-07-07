import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TipoComprobante} from '../../../domain/tipocomprobante';
import {Cliente} from '../../../domain/cliente';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';
import {Observable} from 'rxjs/Observable';
import {Comprobante} from '../../../domain/comprobante';
import {IMyDate, IMyDpOptions} from 'mydatepicker';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-nota',
  templateUrl: './nota.component.html',
  styleUrls: ['./nota.component.css']
})
export class NotaComponent implements OnInit, AfterViewInit, OnDestroy {
  listaClientes: Cliente[];
  @Input() tipoNota: string;
  clienteAsync: string;
  clientes: any;
  clienteCodAsync: string;
  clientesCod: any;
  tipoComprobante: TipoComprobante = new TipoComprobante;
  busquedaCliente: string;
  busquedaClienteSeleccionado: Cliente;
  busquedaClientes: Cliente[];
  iva = 0.21;
  regexTipoA: RegExp = new RegExp('..A');
  cliente: Cliente;
  nota: Comprobante = new Comprobante;
  importe: string | number = 0.00;
  @ViewChild('typeaheadNombreCliente')
  private typeaheadNombreClienteElement: ElementRef;
  fecha: any;
  myDatePickerOptions: IMyDpOptions;
  typeaheadNombreClienteNoResults: boolean;
  typeaheadCodigoClienteNoResults: boolean;
  submitted = false;

  constructor(private apiService: ApiService,
              private alertService: AlertService, ) {
    this.clientes = Observable.create((observer: any) => {
      this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        this.listaClientes = json;
        observer.next(json);
      });
    });

    this.clientesCod = Observable.create((observer: any) => {
      this.apiService.get('clientes/codigo/' + this.clienteCodAsync).subscribe(json => {
        if (json === '') {
          this.listaClientes = [];
          observer.next([]);
        } else {
          this.listaClientes = [json];
          observer.next([json]);
        }
      });
    });
  }

  ngOnInit() {
    this.cliente = new Cliente;
    this.nota = new Comprobante;
    this.importe = 0.00;
    this.tipoComprobante = new TipoComprobante;
    this.clienteAsync = '';
    this.clienteCodAsync = '';
    this.nota.importe_total = 0;
    this.nota.punto_venta = '0001';
    this.nota.anulado = false;
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
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
  }

  ngAfterViewInit(): void {
    this.typeaheadNombreClienteElement.nativeElement.focus();
  }

  onClienteChanged(event) {
    this.typeaheadNombreClienteNoResults = false;
    this.typeaheadCodigoClienteNoResults = false;
    this.cliente = event;
    this.clienteCodAsync = this.cliente.codigo;
    this.clienteAsync = this.cliente.nombre;
    this.apiService.get('tipocomprobantes/' + this.tipoNota + '/' + this.cliente.tipo_responsable).subscribe( json => {
      this.tipoComprobante = json;
      let month = this.tipoComprobante.ultima_fecha.slice(5, 7);
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      let day = this.tipoComprobante.ultima_fecha.slice(8, 10);
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      const options = JSON.parse(JSON.stringify(this.myDatePickerOptions));
      options.disableUntil = {
        year: +this.tipoComprobante.ultima_fecha.slice(0, 4),
        month: +month,
        day: +day
      };

      if (this.fechaMayor(options.disableUntil, this.fecha)) {
        const copyDate = JSON.parse(JSON.stringify(this.fecha));
        copyDate.date = JSON.parse(JSON.stringify(options.disableUntil));
        this.fecha = copyDate;
      }
      this.myDatePickerOptions = options;

      this.apiService.get('contadores/' + this.nota.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        if (contador === '') {
          this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.nota.punto_venta, false);
        } else {
          this.nota.numero = +contador.ultimo_generado + 1;
          this.nota.numero = ('0000000' + this.nota.numero).slice(-8);
        }
      });
      this.calcularImportes();
    });
  }

  generarNota() {
    this.nota.cliente_id = this.cliente.id;
    this.nota.cliente_cuit = this.cliente.cuit;
    this.nota.cliente_nombre = this.cliente.nombre;
    this.nota.cliente_tipo_resp = this.cliente.tipo_responsable;
    this.nota.tipo_comprobante_id = this.tipoComprobante.id;
    this.nota.alicuota_iva = this.iva;
    this.nota.saldo = 0;
    this.nota.lista_id = this.cliente.lista_id;
    this.nota.items = [];

    this.nota.fecha =  this.fecha.date.year + '-' + this.fecha.date.month + '-' + this.fecha.date.day;

    this.apiService.post('comprobantes', this.nota).subscribe( json => {
      if (json.hasOwnProperty('error')) {
        this.alertService.error(json['error']);
      } else {
        this.alertService.success('El comprobante se ha generado con éxito');
        this.ngOnInit();
        this.typeaheadNombreClienteElement.nativeElement.focus();
      }
    });
  }

  buscarClientes() {
    this.busquedaClienteSeleccionado = null;
    this.apiService.get('clientes/buscar/' + this.busquedaCliente).subscribe( json => {
      this.busquedaClientes = json;
    });
  }

  confirmarBusquedaCliente () {
    this.clienteAsync = this.busquedaClienteSeleccionado.nombre;
    this.clienteCodAsync = this.busquedaClienteSeleccionado.codigo;
    this.onClienteChanged(this.busquedaClienteSeleccionado);
  }

  onImporteChanged(importe: number) {
    this.importe = importe;
    this.calcularImportes();
  }

  private calcularImportes() {
    this.nota.importe_neto = +this.importe;
    this.nota.importe_neto = this.nota.importe_neto.toFixed(2);
    switch (this.tipoComprobante.codigo.substr(2, 1)) {
      case 'A':
        this.nota.importe_iva = (+this.nota.importe_neto * this.iva).toFixed(2);
        this.nota.importe_total = (+this.nota.importe_neto + +this.nota.importe_iva).toFixed(2);
        break;
      case 'B': case 'C': default:
      this.nota.importe_total = this.nota.importe_neto;
      break;
    }
  }

  changeTypeaheadNombreClienteNoResults(e: boolean): void {
    this.typeaheadNombreClienteNoResults = e;
  }

  changeTypeaheadCodigoClienteNoResults(e: boolean): void {
    this.typeaheadCodigoClienteNoResults = e;
  }

  typeaheadNombreClienteOnBlur() {
    if (!isNullOrUndefined(this.clienteAsync)
      && this.clienteAsync.length > 0
      && this.clienteAsync !== this.cliente.nombre
      && !this.typeaheadNombreClienteNoResults) {
      this.cliente = this.listaClientes[0];
      this.onClienteChanged(this.cliente);
    }
  }

  typeaheadCodClienteOnBlur() {
    if (!isNullOrUndefined(this.clienteCodAsync)
      && this.clienteCodAsync.length > 0
      && this.clienteCodAsync !== this.cliente.codigo
      && !this.typeaheadCodigoClienteNoResults) {
      this.cliente = this.listaClientes[0];
      this.onClienteChanged(this.cliente);
    }
  }

  private fechaMayor(primerFecha: IMyDate, segundaFecha: any): boolean {
    return (primerFecha.year > segundaFecha.date.year)
      ||  ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month > segundaFecha.date.month))
      || ((primerFecha.year === segundaFecha.date.year) &&
        (primerFecha.month === segundaFecha.date.month)
        && primerFecha.day > segundaFecha.date.day);
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalBuscarCliente')).modal('hide');
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
