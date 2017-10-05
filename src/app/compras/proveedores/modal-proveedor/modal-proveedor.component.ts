import {AfterViewChecked, Component} from '@angular/core';
import {ModalAbmComponent} from '../../../shared/components/abm/modal-abm/modal-abm.component';
import {Proveedor} from '../../../shared/domain/proveedor';

@Component({
  selector: 'app-modal-proveedor',
  templateUrl: './modal-proveedor.component.html',
  styleUrls: ['./modal-proveedor.component.css']
})
export class ModalProveedorComponent extends ModalAbmComponent<Proveedor> implements AfterViewChecked {
  element = new Proveedor();
  elementClass = Proveedor;
  cuitmask = [/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/];
  telmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  celmask = ['(', '0', /\d/, /\d/, /\d/, ')', ' ', '1', '5', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

  cleanMotivo() {
    // si es no-activo y el trigger fue un click, es porque acaba de pasar de activo -> no-activo
    if (!this.element.activo) {
      this.element.motivo = '';
    }
  }
}
