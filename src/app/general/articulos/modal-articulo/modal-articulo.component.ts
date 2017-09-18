import { Component } from '@angular/core';
import {Articulo} from '../../../shared/domain/articulo';
import {ModalAbmComponent} from '../../../shared/abm/modal-abm/modal-abm.component';

@Component({
  selector: 'app-modal-articulo',
  templateUrl: '../../../shared/abm/modal-abm/modal-abm.component.html',
  styleUrls: ['./modal-articulo.component.css']
})
export class ModalArticuloComponent extends ModalAbmComponent<Articulo> {
  element = new Articulo();
  elementClass = Articulo;
  modalsize = 'modal-lg';
  formRows = [
    [{name: 'codigo', label: 'Código', labelsize: 1, fieldsize: 3},
      {name: 'activo', label: 'Activo', labelsize: 1, fieldsize: 1, offset: 6, type: 'checkbox'}],
    [{name: 'codigo_fabrica', label: 'Código fábrica', labelsize: 1, fieldsize: 3, placeholder: '0'},
      {name: 'codigo_auxiliar', label: 'Código auxiliar', labelsize: 1, fieldsize: 3, placeholder: '0'},
      {name: 'lleva_stock', label: 'Lleva stock', labelsize: 1, fieldsize: 1, offset: 2, type: 'checkbox'}],
    [{name: 'nombre', label: 'Nombre', labelsize: 1, fieldsize: 11}],
    [{name: 'marca_id', label: 'Marca', labelsize: 1, fieldsize: 5, femenino: true},
      {name: 'subrubro_id', label: 'Subrubro', labelsize: 1, fieldsize: 5}],
    [{name: 'nombre_reducido', label: 'Nombre reducido', labelsize: 1, fieldsize: 3}],
    [{name: 'punto_pedido', label: 'Punto pedido', labelsize: 1, fieldsize: 3, align: 'text-center', placeholder: '0'},
      {name: 'bajo_minimo', label: 'Bajo mínimo', labelsize: 1, fieldsize: 3, align: 'text-center', placeholder: '0'},
      {name: 'costo', label: 'Costo', labelsize: 1, fieldsize: 3, align: 'text-right', placeholder: '0.00'}],
    [{name: 'motivo', label: 'Motivo', labelsize: 1, fieldsize: 9, condition: 'activo'}]
  ];
}
