import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Articulo} from '../../../shared/domain/articulo';
import {ApiService} from '../../../shared/services/api.service';
import {Observable} from 'rxjs/Observable';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-articulo-codigo-typeahead',
  templateUrl: './articuloCodigoTypeahead.component.html',
  styleUrls: ['./articuloTypeahead.component.css']
})
export class ArticuloCodigoTypeaheadComponent implements OnInit {
  @Input() codigoArticulo: String;
  @Output() artSelected: EventEmitter<Articulo> = new EventEmitter<Articulo>();
  @Output() noResult: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  articulo: Articulo = new Articulo;
  articulos: any;
  listaArticulos: Articulo[];
  typeaheadNoResults: boolean;
  constructor(private apiService: ApiService) {
    this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/codigo/' + this.codigoArticulo).subscribe( json => {
        if (json === '') {
          this.listaArticulos = [];
          observer.next([]);
        } else {
          this.listaArticulos = [json];
          observer.next([json]);
        }
      });
    });
  }

  ngOnInit() {
  }

  onArticuloChanged(articulo: Articulo) {
    this.codigoArticulo = articulo.codigo;
    this.articulo = articulo;
    this.artSelected.emit(articulo);
  }

  changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
    this.noResult.emit(e);
  }

  typeaheadOnBlur() {
    if (!isNullOrUndefined(this.codigoArticulo)
      && this.codigoArticulo.length > 0
      && this.codigoArticulo !== this.articulo.codigo
      && !this.typeaheadNoResults) {
      this.onArticuloChanged(this.listaArticulos[0]);
    }
  }
}
