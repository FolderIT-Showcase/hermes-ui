import { Component, OnInit } from '@angular/core';
import {Vendedor} from '../../../shared/domain/vendedor';
import {ModalAbmComponent} from '../../../shared/abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-vendedor',
  templateUrl: '../../../shared/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-vendedor.component.css']
})
export class ModalVendedorComponent extends ModalAbmComponent<Vendedor> implements OnInit {
  element = new Vendedor();
  elementClass = Vendedor;
  formRows = [
    [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}],
    [{name: 'zona_id', label: 'Zona', labelsize: 2, fieldsize: 10, femenino: true}],
    [{name: 'comision', label: 'Comisión', labelsize: 2, fieldsize: 5, femenino: true, align: 'text-right', placeholder: '0,00'}]
  ];
}
