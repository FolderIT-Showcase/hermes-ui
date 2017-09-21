import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Cheque} from '../../../shared/domain/cheque';
import {Banco} from '../../../shared/domain/banco';
import {Cliente} from '../../../shared/domain/cliente';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-seleccion-cheques',
  templateUrl: './seleccion-cheques.component.html',
  styleUrls: ['./seleccion-cheques.component.css']
})
export class SeleccionChequesComponent implements OnInit {
  @Input() cheques: Cheque[];
  @Input() bancos: Banco[];
  @Input() clientes: Cliente[];
  @Output() chequesSeleccionados: EventEmitter<Cheque[]> = new EventEmitter();
  busquedaClienteId: number;
  busquedaBancoId: number;
  chequesAMostrar: Cheque[] = [];
  private clienteId = 0;
  private bancoId = 0;

  static open() {
    (<any>$('#modalSeleccionCheque')).modal('show');
  }

  static close() {
    (<any>$('#modalSeleccionCheque')).modal('hide');
  }

  constructor() { }

  ngOnInit() {
    this.cheques.forEach(element => {
      element.banco_nombre = this.bancos.find(x => x.id === element.banco_id).nombre;
    });

    this.cheques.forEach(element => {
      if (!!element.cliente_id) {
        element.cliente_nombre = this.clientes.find(x => x.id === element.cliente_id).nombre;
      }
    });
  }

  abrir() {
    this.chequesAMostrar = this.cheques;
    this.filtrarCheques();
    SeleccionChequesComponent.open();
  }

  cerrar() {
    SeleccionChequesComponent.close();
  }

  onClienteChanged(value) {
    this.clienteId = +value;
    this.filtrarCheques();
  }

  onBancoChanged(value) {
    this.bancoId = +value;
    this.filtrarCheques();
  }

  private filtrarCheques() {
    this.chequesAMostrar = this.cheques;
    if (!isNullOrUndefined(this.clienteId) && this.clienteId !== 0) {
      this.chequesAMostrar = this.chequesAMostrar.filter(x => x.cliente_id === this.clienteId);
    }
    if (!isNullOrUndefined(this.bancoId) && this.bancoId !== 0) {
      this.chequesAMostrar = this.chequesAMostrar.filter(x => x.banco_id === this.bancoId);
    }
  }

  toggleAll(value) {
    this.chequesAMostrar.forEach( reg => {
      reg.enlista = value;
    });
  }

  aceptar() {
    this.chequesSeleccionados.emit(this.cheques.filter(x => x.enlista));
    this.cerrar();
  }
}
