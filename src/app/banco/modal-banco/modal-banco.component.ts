import { Component } from '@angular/core';
import {Banco} from '../../../domain/banco';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-banco',
  templateUrl: './modal-banco.component.html',
  styleUrls: ['./modal-banco.component.css']
})
export class ModalBancoComponent extends ModalAbmComponent<Banco> {
  element = new Banco();
  elementClass = Banco;
}
