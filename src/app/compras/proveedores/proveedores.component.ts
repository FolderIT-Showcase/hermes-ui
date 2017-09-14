import { Component,  ViewChild } from '@angular/core';
import { Proveedor } from 'app/shared/domain/proveedor';
import {ModalProveedorComponent} from './modal-proveedor/modal-proveedor.component';
import {AbmComponent} from '../../shared/abm/abm.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent {
  proveedor = Proveedor;
  modal = ModalProveedorComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  // noinspection JSMethodCanBeStatic
  cargarTiposResponsable(data) {
    data.tipos_responsable = [
      {clave: 'RI', nombre: 'Responsable Inscripto'},
      {clave: 'NR', nombre: 'No Responsable'},
      {clave: 'SE', nombre: 'Sujeto Exento'},
      {clave: 'CF', nombre: 'Consumidor Final'},
      {clave: 'M', nombre: 'Monotributista'},
      {clave: 'PE', nombre: 'Proveedor del Exterior'},
      {clave: 'CE', nombre: 'Cliente del Exterior'}
    ];
    return Observable.of(data);
  }

  asignarTiposResponsable(proveedores, data) {
    proveedores.forEach(element => {
      element.tipo_responsable_str = data.tipos_responsable.find(x => x.clave === element.tipo_responsable).nombre; });
    return Observable.of(proveedores);
  }

  asignarTipoResponsable(proveedor, data) {
    proveedor.tipo_responsable_str = data.tipos_responsable.find(x => x.clave === proveedor.tipo_responsable).nombre;
    return Observable.of(proveedor);
  }

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
