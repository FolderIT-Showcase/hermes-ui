import {Component, OnDestroy, OnInit} from '@angular/core';
import {Localidad} from '../../../shared/domain/localidad';
import {Provincia} from '../../../shared/domain/provincia';
import {Vendedor} from '../../../shared/domain/vendedor';
import {Zona} from '../../../shared/domain/zona';
import {ApiService} from '../../../shared/services/api.service';
import {Subscription} from 'rxjs/Subscription';
import {ImpresionService} from '../../../shared/services/impresion.service';

@Component({
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.component.html',
  styleUrls: ['./listado-clientes.component.css']
})
export class ListadoClientesComponent implements OnDestroy {
  parametroReporteFiltrarPorVendedor = false;
  parametroReporteVendedor: Number;
  parametroReporteFiltrarPorZona = false;
  parametroReporteZona: Number;
  parametroReporteFiltrarPorProvincia = false;
  parametroReporteProvincia: Number;
  parametroReporteFiltrarPorLocalidad = false;
  parametroReporteLocalidad: Number;
  parametroReporteSoloActivos: Number;
  localidades: Localidad[] = [];
  provincias: Provincia[] = [];
  vendedores: Vendedor[] = [];
  zonas: Zona[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private impresionService: ImpresionService) { }

  mostrarModalReporte() {
    this.parametroReporteFiltrarPorVendedor = false;
    this.parametroReporteVendedor = 0;
    this.parametroReporteFiltrarPorZona = false;
    this.parametroReporteZona = 0;
    this.parametroReporteFiltrarPorProvincia = false;
    this.parametroReporteProvincia = 0;
    this.parametroReporteFiltrarPorLocalidad = false;
    this.parametroReporteLocalidad = 0;
    this.parametroReporteSoloActivos = 1;
    (<any>$('#modalReporte')).modal('show');
    this.cargarProvincias();
    this.cargarVendedores();
    this.cargarZonas();
  }

  onParametroReporteVendedorChanged(value) {
    this.parametroReporteVendedor = +value;
  }

  onParametroReporteZonaChanged(value) {
    this.parametroReporteZona = +value;
  }

  onParametroReporteProvinciaChanged(value) {
    this.parametroReporteProvincia = +value;
    this.parametroReporteLocalidad = 0;
    this.cargarLocalidades(value);
  }

  generarReporteClientes() {
    if (this.parametroReporteFiltrarPorVendedor === false) {
      this.parametroReporteVendedor = 0;
    }
    if (this.parametroReporteFiltrarPorZona === false) {
      this.parametroReporteZona = 0;
    }
    if (this.parametroReporteFiltrarPorProvincia === false) {
      this.parametroReporteProvincia = 0;
    }
    if (this.parametroReporteFiltrarPorLocalidad   === false) {
      this.parametroReporteLocalidad = 0;
    }

    this.subscriptions.add(this.apiService.downloadPDF('clientes/reporte', {
        'vendedor': this.parametroReporteVendedor,
        'zona': this.parametroReporteZona,
        'provincia': this.parametroReporteProvincia,
        'localidad': this.parametroReporteLocalidad,
        'activos': this.parametroReporteSoloActivos
      }
    ).subscribe(
      (res) => {
        this.impresionService.imprimir(res);
      }
    ));
  }

  cargarProvincias() {
    if (this.provincias.length === 0) {
      this.subscriptions.add(this.apiService.get('provincias').subscribe(
        json => {
          this.provincias = json;
        }
      ));
    }
  }

  cargarLocalidades(provinciaId: number) {
    this.subscriptions.add(this.apiService.get('provincias/' + provinciaId).subscribe(
      json => {
        this.localidades = json.localidades;
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
  ngOnDestroy(): void {
  }
}
