import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Subrubro} from '../../../domain/subrubro';

@Component({
  selector: 'app-modal-subrubro',
  templateUrl: '../../abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-subrubro.component.css']
})
export class ModalSubrubroComponent extends ModalAbmComponent<Subrubro> {
  element = new Subrubro();
  elementClass = Subrubro;
  formRows = [
    [{name: 'codigo', label: 'Código', labelsize: 2, fieldsize: 5}],
    [{name: 'rubro_id', label: 'Rubro', labelsize: 2, fieldsize: 10}],
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}]
  ];
}
