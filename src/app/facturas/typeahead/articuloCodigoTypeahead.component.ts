import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Articulo} from '../../../domain/articulo';
import {ApiService} from '../../../service/api.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-articulo-codigo-typeahead',
  templateUrl: './articuloCodigoTypeahead.component.html',
  styleUrls: ['./articuloTypeahead.component.css']
})
export class ArticuloCodigoTypeaheadComponent implements OnInit {
  @Input() codigoArticulo: String;
  @Output() artSelected: EventEmitter<Articulo> = new EventEmitter<Articulo>();
  articulos: Articulo[];
  constructor(private apiService: ApiService) {
    this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/codigo/' + this.codigoArticulo).subscribe( json => {
        observer.next([json]);
      });
    });
  }

  ngOnInit() {
  }

  onArticuloChanged(articulo: Articulo) {
    this.codigoArticulo = articulo.codigo;
    this.artSelected.emit(articulo);
  }
}
