import {Component, ViewChild} from '@angular/core';
import { Marca } from 'domain/marca';
import {ModalMarcaComponent} from './modal-marca/modal-marca.component';
import {AbmComponent} from '../abm/abm.component';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent {
  marca = Marca;
  modal = ModalMarcaComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
