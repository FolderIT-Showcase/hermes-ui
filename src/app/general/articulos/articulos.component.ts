import { Component, ViewChild } from '@angular/core';
import { Articulo } from '../../shared/domain/articulo';
import { ApiService } from '../../shared/services/api.service';
import {ModalArticuloComponent} from './modal-articulo/modal-articulo.component';
import {AbmComponent} from '../../shared/components/abm/abm.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent {
  articulo = Articulo;
  modal = ModalArticuloComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  constructor(private apiService: ApiService) {}

  cargarMarcaSubrubro(data) {
    const obs1 = this.apiService.get('marcas').map(
      json => {
        data.marcas = json;
        return data;
      });
    const obs2 = this.apiService.get('subrubros').map(
      json => {
        data.subrubros = json;
        return data;
      });
    return Observable.zip(obs1, obs2);
  }

  asignarNombreMarcasSubrubros(articulos, data) {
    articulos.forEach(element => {
      element.marca_nombre = data.marcas.find(x => x.id === element.marca_id).nombre;
      element.subrubro_nombre = data.subrubros.find(x => x.id === element.subrubro_id).nombre;
    });
    return Observable.of(articulos);
  }

  asignarNombreMarcaSubrubro(articulo, data) {
    const num = articulo.costo;
    articulo.costo = !isNaN(+num) ? (+num).toFixed(2) : num;

    articulo.marca_nombre = data.marcas.find(x => x.id === articulo.marca_id).nombre;
    articulo.subrubro_nombre = data.subrubros.find(x => x.id === articulo.subrubro_id).nombre;
    return Observable.of(articulo);
  }

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
