import {Component, OnInit} from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Zona} from '../../../domain/zona';

@Component({
  selector: 'app-modal-zona',
  templateUrl: './modal-zona.component.html',
  styleUrls: ['./modal-zona.component.css']
})
export class ModalZonaComponent extends ModalAbmComponent<Zona> implements OnInit {
  element = new Zona();
  elementClass = Zona;
}
