import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../shared/services/api.service';
import {AlertService} from '../../shared/services/alert.service';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';

@Component({
  selector: 'app-libro-iva',
  templateUrl: './libro-iva.component.html',
  styleUrls: ['./libro-iva.component.css']
})
export class LibroIvaComponent implements OnInit {
  tipoIVA = 'ventas';
  periodo: string;
  periodomask = [/[0-1]/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  submitted = false;
  primerpagina = 1;

  constructor(private apiService: ApiService, private alertService: AlertService, private navbarTitleService: NavbarTitleService) { }

  ngOnInit() {
    this.navbarTitleService.setTitle('Libro de IVA Compras/Ventas');
  }

  imprimir(f: any) {
    this.submitted = true;
    if (f.valid) {
        this.apiService.downloadPDF('libroiva', {
          'page_init': this.primerpagina,
          'tipo_libro_iva': this.tipoIVA,
          'periodo_month': this.periodo.substr(0, 2),
          'periodo_year': this.periodo.substr(3, 4),
        }).subscribe(
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
  }
}
