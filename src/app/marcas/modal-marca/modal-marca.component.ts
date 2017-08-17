import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Marca} from '../../../domain/marca';

@Component({
  selector: 'app-modal-marca',
  templateUrl: './modal-marca.component.html',
  styleUrls: ['./modal-marca.component.css']
})
export class ModalMarcaComponent extends ModalAbmComponent<Marca> {
  element = new Marca();
  elementClass = Marca;
}
