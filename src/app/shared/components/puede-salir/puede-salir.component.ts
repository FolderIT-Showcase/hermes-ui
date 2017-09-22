import {Component, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-puede-salir',
  templateUrl: './puede-salir.component.html',
  styleUrls: ['./puede-salir.component.css']
})
export class PuedeSalirComponent implements OnDestroy {
  @Input() modificado: boolean;
  puedeSalir: Subject<Boolean> = new Subject;

  static open() {
    (<any>$('#modalPuedeSalir')).modal('show');
  }

  static close() {
    (<any>$('#modalPuedeSalir')).modal('hide');
  }

  check() {
    if (this.modificado) {
      PuedeSalirComponent.open();
      return this.puedeSalir;
    } else {
      return true;
    }
  }

  continuar() {
    this.puedeSalir.next(true);
  }

  cancelar() {
    this.puedeSalir.next(false);
  }

  ngOnDestroy() {
    PuedeSalirComponent.close();
    this.puedeSalir.unsubscribe();
  }
}
