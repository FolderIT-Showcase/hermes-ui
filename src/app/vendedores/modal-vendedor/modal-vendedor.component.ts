import { Component, OnInit } from '@angular/core';
import {Vendedor} from '../../../domain/vendedor';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-vendedor',
  templateUrl: './modal-vendedor.component.html',
  styleUrls: ['./modal-vendedor.component.css']
})
export class ModalVendedorComponent extends ModalAbmComponent<Vendedor> implements OnInit {
  element = new Vendedor();
  elementClass = Vendedor;
}
