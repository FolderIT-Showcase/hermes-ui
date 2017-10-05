import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-puede-salir',
  templateUrl: './puede-salir.component.html',
  styleUrls: ['./puede-salir.component.css']
})
export class PuedeSalirComponent implements OnInit, OnDestroy {
  @Input() modificado: boolean;
  puedeSalir: Subject<Boolean> = new Subject;

  static open() {
    (<any>$('#modalPuedeSalir')).modal('show');
  }

  static close() {
    (<any>$('#modalPuedeSalir')).modal('hide');
  }

  ngOnInit() {
    (<any>$('#modalPuedeSalir')).on('hidden.bs.modal', () => {
      this.puedeSalir.next(false);
    });
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
    this.puedeSalir.complete();
  }
}
