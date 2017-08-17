import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Rubro} from '../../../domain/rubro';

@Component({
  selector: 'app-modal-rubro',
  templateUrl: './modal-rubro.component.html',
  styleUrls: ['./modal-rubro.component.css']
})
export class ModalRubroComponent extends ModalAbmComponent<Rubro> {
  element = new Rubro();
  elementClass = Rubro;
}
