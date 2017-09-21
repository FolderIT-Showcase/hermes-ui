import {Component,  ViewChild} from '@angular/core';
import { Vendedor } from '../../shared/domain/vendedor';
import {ModalVendedorComponent} from './modal-vendedor/modal-vendedor.component';
import {AbmComponent} from '../../shared/abm/abm.component';
import {ApiService} from '../../shared/services/api.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.css']
})
export class VendedoresComponent {
  vendedor = Vendedor;
  modal = ModalVendedorComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  constructor(private apiService: ApiService) {}

  cargarZonas(data) {
    return this.apiService.get('zonas').map(
      json => {
        data.zonas = json;
        return data;
      });
  }

  asignarNombreZonas(vendedores, data) {
    vendedores.forEach(element => {
        element.zona_nombre = data.zonas.find(x => x.id === element.zona_id).nombre;
      });
    return Observable.of(vendedores);
  }

  asignarNombreZona(vendedor, data) {
    const num = vendedor.comision;
    vendedor.comision = !isNaN(+num) ? (+num).toFixed(2) : num;

    vendedor.zona_nombre = data.zonas.find(x => x.id === vendedor.zona_id).nombre;
    return Observable.of(vendedor);
  }

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
