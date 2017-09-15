import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {IMyDpOptions} from 'mydatepicker';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';
import {AlertService} from '../../shared/services/alert.service';
import {ApiService} from '../../shared/services/api.service';
import {TipoComprobante} from '../../shared/domain/tipocomprobante';
import {HelperService} from '../../shared/services/helper.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-resumen-ventas',
  templateUrl: './resumen-ventas.component.html',
  styleUrls: ['./resumen-ventas.component.css']
})
export class ResumenVentasComponent implements OnInit, OnDestroy {
  myDatePickerOptions: IMyDpOptions;
  fechaInicio: any;
  fechaFin: any;
  tipo = 'fecha';
  tiposComprobantes: TipoComprobante[];
  tiposComprobantesCopy: TipoComprobante[];
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) { }

  ngOnInit() {
    this.navbarTitleService.setTitle('Imprimir Reportes Resumen de Ventas');
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();

    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.fechaInicio = { date: { year: firstDay.getFullYear(), month: firstDay.getMonth() + 1, day: firstDay.getDate() }};
    this.fechaFin =  { date: { year: lastDay.getFullYear(), month: lastDay.getMonth() + 1, day: lastDay.getDate() }};

    this.subscriptions.add(this.apiService.get('tipocomprobantes')
      .subscribe(json => {
        json.forEach( tipo => {
          tipo.enlista = tipo.codigo !== 'PRX';
        });
        this.tiposComprobantes = json;
      }));
  }

  mostrarModalTiposComprobantes() {
    this.tiposComprobantesCopy = JSON.parse(JSON.stringify(this.tiposComprobantes));
  }


  rangoFechaInvalido(): boolean {
    return HelperService.rangoFechaInvalido(this.fechaInicio, this.fechaFin);
  }

  editarItems() {
    this.tiposComprobantes = JSON.parse(JSON.stringify(this.tiposComprobantesCopy));
  }

  toggleAll(value) {
    this.tiposComprobantesCopy.forEach( tipo => {
      tipo.enlista = value;
    });
  }

  imprimir() {
    const fechaInicioAEnviar = this.fechaInicio.date.year + '-' +
      this.fechaInicio.date.month + '-' +
      this.fechaInicio.date.day;
    const fechaFinAEnviar = this.fechaFin.date.year + '-' + this.fechaFin.date.month + '-' + this.fechaFin.date.day;
    let codigos = '';
    this.tiposComprobantes.forEach( tipo => {
      if (tipo.enlista) {
        codigos += tipo.codigo + ',';
      }
    });
    codigos = codigos.slice(0, -1);

    this.subscriptions.add(this.apiService.downloadPDF('resumenventas', {
        'fecha_inicio': fechaInicioAEnviar,
        'fecha_fin': fechaFinAEnviar,
        'tipo': this.tipo,
        'codigos': codigos
      }
    ).subscribe(
      (res) => {
        const fileURL = URL.createObjectURL(res);
        try {
          const win = window.open(fileURL, '_blank');
          win.print();
        } catch (e) {
          this.alertService.error('Debe permitir las ventanas emergentes para poder imprimir este documento');
        }
      }
    ));
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    (<any>$('#modalItems')).modal('hide');
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
