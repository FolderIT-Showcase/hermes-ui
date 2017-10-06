import { Component } from '@angular/core';
import {ModalAbmComponent} from '../../../shared/components/abm/modal-abm/modal-abm.component';
import {PuntoVenta} from '../../../shared/domain/puntoVenta';

@Component({
  selector: 'app-modal-punto-venta',
  templateUrl: '../../../shared/components/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-punto-venta.component.css']
})
export class ModalPuntoVentaComponent extends ModalAbmComponent<PuntoVenta> {
  element = new PuntoVenta();
  elementClass = PuntoVenta;
  // TODO validar id repetido
  formRows = [
    [{name: 'id', label: 'Número', labelsize: 2, fieldsize: 4},
      {name: 'habilitado', label: 'Habilitado', labelsize: 2, fieldsize: 2, offset: 2, type: 'checkbox'}],
    [{name: 'descripcion', label: 'Descripción', labelsize: 2, fieldsize: 10}],
    [{name: 'tipo_impresion', label: 'Tipo de Impresión', labelsize: 2, fieldsize: 10}]
  ];
}
