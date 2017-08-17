import { Component } from '@angular/core';
import {Articulo} from '../../../domain/articulo';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-articulo',
  templateUrl: './modal-articulo.component.html',
  styleUrls: ['./modal-articulo.component.css']
})
export class ModalArticuloComponent extends ModalAbmComponent<Articulo> {
  element = new Articulo();
  elementClass = Articulo;
}
