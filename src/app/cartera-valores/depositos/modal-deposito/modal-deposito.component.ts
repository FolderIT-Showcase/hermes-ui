import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Cliente} from '../../../../domain/cliente';
import {Deposito} from '../../../../domain/deposito';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from 'service/api.service';
import {HelperService} from '../../../../service/helper.service';

@Component({
  selector: 'app-modal-deposito',
  templateUrl: './modal-deposito.component.html',
  styleUrls: ['./modal-deposito.component.css']
})
export class ModalDepositoComponent implements OnInit {
  @Input() clientes: Cliente[];
  @Input() cuentas: Cliente[];
  @Input() shouldSendApiRequest = true;
  @Output() eventNew = new EventEmitter<Deposito>();
  @Output() eventEdit = new EventEmitter<Deposito>();
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  enNuevo = false;
  modalTitle: string;
  deposito: Deposito = new Deposito();

  static open() {
    (<any>$('#modalEditar')).modal('show');
  }

  static close() {
    (<any>$('#modalEditar')).modal('hide');
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();
  }

  nuevoDeposito() {
    this.modalTitle = 'Nuevo Depósito';
    this.enNuevo = true;
    this.deposito = new Deposito;
    const today = new Date();
    this.deposito.fecha_ingreso =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    ModalDepositoComponent.open();
  }

  editarDeposito(depositoAEditar: Deposito) {
    this.modalTitle = 'Editar Depósito';
    this.enNuevo = false;
    this.deposito = JSON.parse(JSON.stringify(depositoAEditar));

    let month = this.deposito.fecha_ingreso.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.deposito.fecha_ingreso.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.deposito.fecha_ingreso =  {
      date: {
        year: this.deposito.fecha_ingreso.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    if (!!this.deposito.fecha_acreditacion) {
      month = this.deposito.fecha_acreditacion.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.deposito.fecha_acreditacion.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.deposito.fecha_acreditacion =  {
        date: {
          year: this.deposito.fecha_acreditacion.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }

    if (!!this.deposito.fecha_deposito) {
      month = this.deposito.fecha_deposito.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.deposito.fecha_deposito.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.deposito.fecha_deposito =  {
        date: {
          year: this.deposito.fecha_deposito.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }
  }

  private cerrar() {
    this.submitted = false;
    ModalDepositoComponent.close();
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.cerrar();

      // Máscara para mostrar siempre 2 decimales
      const num = this.deposito.importe;
      this.deposito.importe = !isNaN(+num) ? (+num).toFixed(2) : num;

      const depositoAEnviar = new Deposito();
      Object.assign(depositoAEnviar, this.deposito);
      depositoAEnviar.fecha_ingreso =  HelperService.myDatePickerDateToString(depositoAEnviar.fecha_ingreso);
      if (!!depositoAEnviar.fecha_acreditacion) {
        depositoAEnviar.fecha_acreditacion = HelperService.myDatePickerDateToString(depositoAEnviar.fecha_acreditacion);
      }
      if (!!depositoAEnviar.fecha_deposito) {
        depositoAEnviar.fecha_deposito = HelperService.myDatePickerDateToString(depositoAEnviar.fecha_deposito);
      }

      if (this.enNuevo) {
        this.enNuevo = false;
        if (this.shouldSendApiRequest) {
          this.apiService.post('depositos', depositoAEnviar).subscribe(
            json => {
              if (!!json.cliente_id) {
                json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
              }
              this.eventNew.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventNew.emit(depositoAEnviar);
          f.form.reset();
        }

      } else {
        if (this.shouldSendApiRequest) {
          this.apiService.put('depositos/' + depositoAEnviar.id, depositoAEnviar).subscribe(
            json => {
              if (!!json.cliente_id) {
                json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
              }
              this.eventEdit.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventEdit.emit(depositoAEnviar);
          f.form.reset();
        }
      }
    }
  }
}
