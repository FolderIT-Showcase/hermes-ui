import { Component, OnInit } from '@angular/core';
import {Localidad} from '../../../domain/localidad';
import {Provincia} from '../../../domain/provincia';
import {Vendedor} from '../../../domain/vendedor';
import {Zona} from '../../../domain/zona';
import {ApiService} from '../../../service/api.service';
import {AlertService} from '../../../service/alert.service';

@Component({
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.component.html',
  styleUrls: ['./listado-clientes.component.css']
})
export class ListadoClientesComponent implements OnInit {
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

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit() {}

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

    this.apiService.downloadPDF('clientes/reporte', {
        'vendedor': this.parametroReporteVendedor,
        'zona': this.parametroReporteZona,
        'provincia': this.parametroReporteProvincia,
        'localidad': this.parametroReporteLocalidad,
        'activos': this.parametroReporteSoloActivos
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
    );
  }

  cargarProvincias() {
    if (this.provincias.length === 0) {
      this.apiService.get('provincias').subscribe(
        json => {
          this.provincias = json;
        }
      );
    }
  }

  cargarLocalidades(provinciaId: number) {
    this.apiService.get('provincias/' + provinciaId).subscribe(
      json => {
        this.localidades = json.localidades;
      }
    );
  }

  cargarVendedores() {
    if (this.vendedores.length === 0) {
      this.apiService.get('vendedores').subscribe(
        json => {
          this.vendedores = json;
        }
      );
    }
  }

  cargarZonas() {
    if (this.zonas.length === 0) {
      this.apiService.get('zonas').subscribe(
        json => {
          this.zonas = json;
        }
      );
    }
  }
}
