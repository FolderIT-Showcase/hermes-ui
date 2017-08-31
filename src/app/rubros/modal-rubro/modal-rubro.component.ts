import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Rubro} from '../../../domain/rubro';

@Component({
  selector: 'app-modal-rubro',
  templateUrl: '../../abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-rubro.component.css']
})
export class ModalRubroComponent extends ModalAbmComponent<Rubro> {
  element = new Rubro();
  elementClass = Rubro;
  formRows = [
    [{name: 'codigo', label: 'Código', labelsize: 2, fieldsize: 10}],
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}]
  ];
}
