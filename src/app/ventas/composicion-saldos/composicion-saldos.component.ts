import {Component, OnDestroy, OnInit} from '@angular/core';
import {Zona} from '../../shared/domain/zona';
import {Vendedor} from '../../shared/domain/vendedor';
import {ApiService} from '../../shared/services/api.service';
import {Cliente} from '../../shared/domain/cliente';
import {TitleService} from '../../shared/services/title.service';
import {Subscription} from 'rxjs/Subscription';
import {ImpresionService} from '../../shared/services/impresion.service';

@Component({
  selector: 'app-composicion-saldos',
  templateUrl: './composicion-saldos.component.html',
  styleUrls: ['./composicion-saldos.component.css']
})
export class ComposicionSaldosComponent implements OnInit, OnDestroy {
  parametroReporteCliente: Number = 0;
  parametroReporteVendedor: Number = 0;
  parametroReporteZona: Number = 0;
  vendedores: Vendedor[] = [];
  zonas: Zona[] = [];
  clientes: Cliente[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private titleService: TitleService,
              private impresionService: ImpresionService) { }

  ngOnInit() {
    this.titleService.setTitle('Imprimir Reporte Composición de Saldos');
    this.cargarVendedores();
    this.cargarZonas();
    this.cargarClientes();
  }

  generarReporte() {
    this.subscriptions.add(this.apiService.downloadPDF('composicionsaldo/imprimir', {
        'cliente': this.parametroReporteCliente,
        'vendedor': this.parametroReporteVendedor,
        'zona': this.parametroReporteZona,
      }
    ).subscribe(
      (res) => {
        this.impresionService.imprimir(res);
      }
    ));
  }

  cargarVendedores() {
    if (this.vendedores.length === 0) {
      this.subscriptions.add(this.apiService.get('vendedores').subscribe(
        json => {
          this.vendedores = json;
        }
      ));
    }
  }

  cargarZonas() {
    if (this.zonas.length === 0) {
      this.subscriptions.add(this.apiService.get('zonas').subscribe(
        json => {
          this.zonas = json;
        }
      ));
    }
  }

  cargarClientes() {
    if (this.clientes.length === 0) {
      this.subscriptions.add(this.apiService.get('clientes').subscribe(
        json => {
          this.clientes = json;
        }
      ));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
