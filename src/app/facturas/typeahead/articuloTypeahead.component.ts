import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Articulo} from '../../../domain/articulo';
import {ApiService} from '../../../service/api.service';
import {Observable} from 'rxjs/Observable';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-articulo-typeahead',
  templateUrl: './articuloTypeahead.component.html',
  styleUrls: ['./articuloTypeahead.component.css']
})
export class ArticuloTypeaheadComponent implements OnInit {
  @Input() nombreArticulo: String;
  @Output() artSelected: EventEmitter<Articulo> = new EventEmitter<Articulo>();
  @Output() noResult: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  articulos: any;
  articulo: Articulo = new Articulo;
  listaArticulos: Articulo[];
  typeaheadNoResults: boolean;
  constructor(private apiService: ApiService) {
    this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/nombre/' + this.nombreArticulo).subscribe( json => {
        this.listaArticulos = json;
        observer.next(json);
      });
    });
  }

  ngOnInit() {
  }

  onArticuloChanged(articulo: Articulo) {
    this.nombreArticulo = articulo.nombre;
    this.articulo = articulo;
    this.artSelected.emit(articulo);
  }

  changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
    this.noResult.emit(e);
  }

  typeaheadOnBlur() {
    if (!isNullOrUndefined(this.nombreArticulo)
      && this.nombreArticulo.length > 0
      && this.nombreArticulo !== this.articulo.nombre
      && !this.typeaheadNoResults) {
      this.onArticuloChanged(this.listaArticulos[0]);
    }
  }
}
