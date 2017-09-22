import {Component, ViewChild} from '@angular/core';
import { Subrubro } from '../../shared/domain/subrubro';
import { ApiService } from '../../shared/services/api.service';
import {ModalSubrubroComponent} from './modal-subrubro/modal-subrubro.component';
import {AbmComponent} from '../../shared/components/abm/abm.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-subrubros',
  templateUrl: './subrubros.component.html',
  styleUrls: ['./subrubros.component.css']
})
export class SubrubrosComponent {
  subrubro = Subrubro;
  modal = ModalSubrubroComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  constructor(private apiService: ApiService) {
  }

  cargarRubros(data) {
    return this.apiService.get('rubros').map(
      json => {
        data.rubros = json;
        return data;
      });
  }

  asignarNombreRubros(subrubros, data) {
    subrubros.forEach(element => {
      element.rubro_nombre = data.rubros.find(x => x.id === element.rubro_id).nombre;
    });
    return Observable.of(subrubros);
  }

  asignarNombreRubro(subrubro, data) {
    subrubro.rubro_nombre = data.rubros.find(x => x.id === subrubro.rubro_id).nombre;
    return Observable.of(subrubro);
  }

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
