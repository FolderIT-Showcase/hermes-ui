import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../../shared/components/abm/modal-abm/modal-abm.component';
import {Marca} from '../../../shared/domain/marca';

@Component({
  selector: 'app-modal-marca',
  templateUrl: '../../../shared/components/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-marca.component.css']
})
export class ModalMarcaComponent extends ModalAbmComponent<Marca> {
  element = new Marca();
  elementClass = Marca;
  formRows = [
    [{name: 'codigo', label: 'Código', labelsize: 2, fieldsize: 10}],
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}]
  ];
}
