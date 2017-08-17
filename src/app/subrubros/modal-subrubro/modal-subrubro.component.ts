import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Subrubro} from '../../../domain/subrubro';

@Component({
  selector: 'app-modal-subrubro',
  templateUrl: './modal-subrubro.component.html',
  styleUrls: ['./modal-subrubro.component.css']
})
export class ModalSubrubroComponent extends ModalAbmComponent<Subrubro> {
  element = new Subrubro();
  elementClass = Subrubro;
}
