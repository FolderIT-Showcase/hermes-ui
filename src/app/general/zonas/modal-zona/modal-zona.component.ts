import {Component, OnInit} from '@angular/core';
import {ModalAbmComponent} from '../../../shared/abm/modal-abm/modal-abm.component';
import {Zona} from '../../../shared/domain/zona';

@Component({
  selector: 'app-modal-zona',
  templateUrl: '../../../shared/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-zona.component.css']
})
export class ModalZonaComponent extends ModalAbmComponent<Zona> implements OnInit {
  element = new Zona();
  elementClass = Zona;
  formRows = [
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}]
  ];
}
