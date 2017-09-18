import {Component, ViewChild} from '@angular/core';
import { Rubro } from 'app/shared/domain/rubro';
import {ModalRubroComponent} from './modal-rubro/modal-rubro.component';
import {AbmComponent} from '../../shared/abm/abm.component';

@Component({
  selector: 'app-rubros',
  templateUrl: './rubros.component.html',
  styleUrls: ['./rubros.component.css']
})
export class RubrosComponent {
  rubro = Rubro;
  modal = ModalRubroComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}
