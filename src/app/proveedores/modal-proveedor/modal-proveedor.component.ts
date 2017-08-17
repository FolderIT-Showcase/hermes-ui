import {AfterViewChecked, ChangeDetectorRef, Component} from '@angular/core';
import {ModalAbmComponent} from '../../abm/modal-abm/modal-abm.component';
import {Proveedor} from '../../../domain/proveedor';
import {ApiService} from '../../../service/api.service';

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

  constructor(apiService: ApiService, private cdRef: ChangeDetectorRef) {
    super(apiService);
  }

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

  cleanMotivo() {
    // si es no-activo y el trigger fue un click, es porque acaba de pasar de activo -> no-activo
    if (!this.element.activo) {
      this.element.motivo = '';
    }
  }
}
