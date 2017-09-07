import { Component, OnInit } from '@angular/core';
import {Zona} from '../../domain/zona';
import {Vendedor} from '../../domain/vendedor';
import {ApiService} from '../../service/api.service';
import {AlertService} from '../../service/alert.service';
import {Cliente} from '../../domain/cliente';

@Component({
  selector: 'app-composicion-saldos',
  templateUrl: './composicion-saldos.component.html',
  styleUrls: ['./composicion-saldos.component.css']
})
export class ComposicionSaldosComponent implements OnInit {
  parametroReporteCliente: Number = 0;
  parametroReporteVendedor: Number = 0;
  parametroReporteZona: Number = 0;
  vendedores: Vendedor[] = [];
  zonas: Zona[] = [];
  clientes: Cliente[] = [];

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit() {
    this.cargarVendedores();
    this.cargarZonas();
    this.cargarClientes();
  }

  generarReporte() {
    this.apiService.downloadPDF('composicionsaldo/imprimir', {
        'cliente': this.parametroReporteCliente,
        'vendedor': this.parametroReporteVendedor,
        'zona': this.parametroReporteZona,
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

  cargarClientes() {
    if (this.clientes.length === 0) {
      this.apiService.get('clientes').subscribe(
        json => {
          this.clientes = json;
        }
      );
    }
  }
}
