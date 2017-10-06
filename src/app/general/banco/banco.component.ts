import {Component, ViewChild} from '@angular/core';
import {Banco} from '../../shared/domain/banco';
import {AbmComponent} from '../../shared/components/abm/abm.component';
import {ModalBancoComponent} from './modal-banco/modal-banco.component';

@Component({
  selector: 'app-banco',
  templateUrl: './banco.component.html',
  styleUrls: ['./banco.component.css']
})
export class BancoComponent {
  banco = Banco;
  modal = ModalBancoComponent;
  @ViewChild(AbmComponent)
  abmComponent: AbmComponent;

  canDeactivate() {
    return this.abmComponent.canDeactivate();
  }
}