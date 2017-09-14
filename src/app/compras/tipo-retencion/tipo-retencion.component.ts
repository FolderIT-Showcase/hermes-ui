import { Component, ViewChild } from '@angular/core';
import {TipoRetencion} from 'app/shared/domain/tipoRetencion';
import {ModalTipoRetencionComponent} from './modal-tipo-retencion/modal-tipo-retencion.component';
import {AbmComponent} from '../../shared/abm/abm.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-tipo-retencion',
  templateUrl: './tipo-retencion.component.html',
  styleUrls: ['./tipo-retencion.component.css']
})
export class TipoRetencionComponent {
  tipoRetencion = TipoRetencion;
  modal = ModalTipoRetencionComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }

  formatAlicuota(retencion, data) {
    const num = retencion.alicuota;
    retencion.alicuota = !isNaN(+num) ? (+num).toFixed(2) : num;

    return Observable.of(retencion);
  }
}
