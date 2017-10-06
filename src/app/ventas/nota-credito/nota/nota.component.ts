import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TipoComprobante} from '../../../shared/domain/tipocomprobante';
import {Cliente} from '../../../shared/domain/cliente';
import {ApiService} from '../../../shared/services/api.service';
import {AlertService} from '../../../shared/services/alert.service';
import {Observable} from 'rxjs/Observable';
import {Comprobante} from '../../../shared/domain/comprobante';
import {IMyDate, IMyDpOptions} from 'mydatepicker';
import {isNullOrUndefined} from 'util';
import {HelperService} from '../../../shared/services/helper.service';
import {Subscription} from 'rxjs/Subscription';
import {PuntoVenta} from '../../../shared/domain/puntoVenta';
import {AuthenticationService} from '../../../shared/services/authentication.service';
import {ImpresionService} from '../../../shared/services/impresion.service';

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
  private subscriptions: Subscription = new Subscription();
  puntosVenta: PuntoVenta[] = [];

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private cdRef: ChangeDetectorRef,
              private impresionService: ImpresionService ) {
    this.clientes = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('clientes/nombre/' + this.clienteAsync).subscribe(json => {
        this.listaClientes = json;
        observer.next(json);
      }));
    });

    this.clientesCod = Observable.create((observer: any) => {
      this.subscriptions.add(this.apiService.get('clientes/codigo/' + this.clienteCodAsync).subscribe(json => {
        if (json === '') {
          this.listaClientes = [];
          observer.next([]);
        } else {
          this.listaClientes = [json];
          observer.next([json]);
        }
      }));
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
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();
    const today = new Date();
    this.fecha =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    this.subscriptions.add(
      this.authenticationService.getCurrentUserParameters().subscribe( params => {
        if (!isNullOrUndefined(params.punto_venta)) {
          params.punto_venta = ('0000' + params.punto_venta).slice(-4);
          this.nota.punto_venta = params.punto_venta;
        }
      }));
    this.cargarPuntosVenta();
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
    this.subscriptions.add(this.apiService.get('tipocomprobantes/' + this.tipoNota + '/' + this.cliente.tipo_responsable).subscribe( json => {
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

      this.subscriptions.add(this.apiService.get('contadores/' + this.nota.punto_venta + '/' + this.tipoComprobante.id).subscribe( contador => {
        if (contador === '') {
          this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.nota.punto_venta, false);
        } else {
          this.nota.numero = +contador.ultimo_generado + 1;
          this.nota.numero = ('0000000' + this.nota.numero).slice(-8);
        }
      }));
      this.calcularImportes();
    }));
  }

  generarNota() {
    this.nota.cliente_id = this.cliente.id;
    this.nota.cliente_cuit = this.cliente.cuit;
    this.nota.cliente_nombre = this.cliente.nombre;
    this.nota.cliente_tipo_resp = this.cliente.tipo_responsable;
    this.nota.tipo_comprobante_id = this.tipoComprobante.id;
    this.nota.alicuota_iva = 100 * this.iva;
    this.nota.saldo = +this.nota.importe_total;
    this.nota.lista_id = this.cliente.lista_id;
    this.nota.items = [];

    this.nota.fecha =  HelperService.myDatePickerDateToString(this.fecha);

    const puntoVenta = this.puntosVenta.find(x => x.id === this.nota.punto_venta);
    let obs: Observable<any>;
    switch (puntoVenta.tipo_impresion) {
      case 'IMP':
        obs = this.imprimirNota();
        break;
      case 'FE':
      case 'IF':
      default:
        obs = this.postNota();
        break;
    }

    this.subscriptions.add(
      obs.subscribe( json => {
      if (json.hasOwnProperty('error')) {
        this.alertService.error(json['error']);
      } else {
        this.alertService.success('El comprobante se ha generado con éxito');
        this.ngOnInit();
        this.typeaheadNombreClienteElement.nativeElement.focus();
      }
    }));
  }

  postNota(): Observable<Comprobante> {
    return this.apiService.post('comprobantes', this.nota);
  }

  imprimirNota() {
    return this.apiService.postDownloadPDF('comprobantes', this.nota)
      .do(pdf => this.impresionService.imprimir(pdf));
  }

  onPuntoVentaChanged(value: string) {
    this.nota.punto_venta = value;
    if (!isNullOrUndefined(this.nota.punto_venta) && !isNullOrUndefined(this.cliente.id)) {
      this.subscriptions.add(
        this.apiService.get('contadores/' + this.nota.punto_venta + '/' + this.tipoComprobante.id).subscribe(contador => {
          if (contador === '') {
            this.alertService.error('No está definido el Contador para el Punto de Venta ' + this.nota.punto_venta, false);
          } else {
            this.nota.numero = +contador.ultimo_generado + 1;
            this.nota.numero = ('0000000' + this.nota.numero).slice(-8);
          }
        })
      );
    }
  }

  buscarClientes() {
    this.busquedaClienteSeleccionado = null;
    this.subscriptions.add(this.apiService.get('clientes/buscar/' + this.busquedaCliente).subscribe( json => {
      this.busquedaClientes = json;
    }));
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
    this.nota.alicuota_iva = 100 * this.iva;
    switch (this.tipoComprobante.codigo.substr(2, 1)) {
      case 'A':
        this.nota.importe_neto = +this.importe;
        this.nota.importe_neto = this.nota.importe_neto.toFixed(2);
        this.nota.importe_iva = (+this.nota.importe_neto * this.iva).toFixed(2);
        this.nota.importe_total = (+this.nota.importe_neto + +this.nota.importe_iva).toFixed(2);
        break;
      case 'B':
      case 'C':
      default:
        this.nota.importe_total = +this.importe;
        this.nota.importe_total = this.nota.importe_total.toFixed(2);
        this.nota.importe_neto = (+this.nota.importe_total / (1 + this.iva)).toFixed(2);
        this.nota.importe_iva = (+this.nota.importe_total - +this.nota.importe_neto).toFixed(2);
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

  cargarPuntosVenta() {
    this.subscriptions.add(this.apiService.get('puntosventa/habilitados').subscribe((json: PuntoVenta[]) => {
      this.puntosVenta = json;
      this.puntosVenta.forEach( pto_venta => {
        pto_venta.id = ('0000' + pto_venta.id).slice(-4);
      });
      if (isNullOrUndefined(this.nota.punto_venta)) {
        this.nota.punto_venta = this.puntosVenta[0].id;
        this.cdRef.detectChanges();
      }
    }));
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalBuscarCliente')).modal('hide');
  }

  ngOnDestroy() {
    this.ocultarModals();
    this.subscriptions.unsubscribe();
  }

  // noinspection JSUnusedGlobalSymbols
  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}