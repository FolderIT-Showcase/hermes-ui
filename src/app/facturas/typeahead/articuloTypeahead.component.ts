import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Articulo} from '../../../domain/articulo';
import {ApiService} from '../../../service/api.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-articulo-typeahead',
  templateUrl: './articuloTypeahead.component.html',
  styleUrls: ['./articuloTypeahead.component.css']
})
export class ArticuloTypeaheadComponent implements OnInit {
  @Input() nombreArticulo: String;
  @Output() artSelected: EventEmitter<Articulo> = new EventEmitter<Articulo>();
  articulos: Articulo[];
  constructor(private apiService: ApiService) {
    this.articulos = Observable.create((observer: any) => {
      this.apiService.get('articulos/nombre/' + this.nombreArticulo).subscribe( json => {
        observer.next(json);
      });
    });
  }

  ngOnInit() {
  }

  onArticuloChanged(articulo: Articulo) {
    this.nombreArticulo = articulo.nombre;
    this.artSelected.emit(articulo);
  }
}
