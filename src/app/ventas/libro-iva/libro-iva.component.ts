import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../shared/services/api.service';
import {TitleService} from '../../shared/services/title.service';
import {Subscription} from 'rxjs/Subscription';
import {ImpresionService} from '../../shared/services/impresion.service';

@Component({
  selector: 'app-libro-iva',
  templateUrl: './libro-iva.component.html',
  styleUrls: ['./libro-iva.component.css']
})
export class LibroIvaComponent implements OnInit, OnDestroy {
  tipoIVA = 'ventas';
  periodo: string;
  periodomask = [/[0-1]/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  submitted = false;
  primerpagina = 1;
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private titleService: TitleService,
              private impresionService: ImpresionService) { }

  ngOnInit() {
    this.titleService.setTitle('Libro de IVA Compras/Ventas');
  }

  imprimir(f: any) {
    this.submitted = true;
    if (f.valid) {
        this.subscriptions.add(this.apiService.downloadPDF('libroiva', {
          'page_init': this.primerpagina,
          'tipo_libro_iva': this.tipoIVA,
          'periodo_month': this.periodo.substr(0, 2),
          'periodo_year': this.periodo.substr(3, 4),
        }).subscribe(
          (res) => {
            this.impresionService.imprimir(res);
          }
        ));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
