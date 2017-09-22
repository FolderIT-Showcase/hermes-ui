import { Component } from '@angular/core';
import {Banco} from '../../../shared/domain/banco';
import {ModalAbmComponent} from '../../../shared/components/abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-banco',
  templateUrl: '../../../shared/components/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-banco.component.css']
})
export class ModalBancoComponent extends ModalAbmComponent<Banco> {
  element = new Banco();
  elementClass = Banco;
  formRows = [
      [{name: 'nombre', label: 'Nombre', labelsize: 2, fieldsize: 10}]
    ];
}
