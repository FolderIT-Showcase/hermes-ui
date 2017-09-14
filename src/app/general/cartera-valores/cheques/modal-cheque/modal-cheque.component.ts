import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Cliente} from '../../../../shared/domain/cliente';
import {Banco} from '../../../../shared/domain/banco';
import {Cheque} from '../../../../shared/domain/cheque';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../../shared/services/api.service';
import {HelperService} from '../../../../shared/services/helper.service';

@Component({
  selector: 'app-modal-cheque',
  templateUrl: './modal-cheque.component.html',
  styleUrls: ['./modal-cheque.component.css']
})
export class ModalChequeComponent implements OnInit {
  @Input() clientes: Cliente[] = [];
  @Input() bancos: Banco[] = [];
  @Input() shouldSendApiRequest = true;
  @Output() eventNew = new EventEmitter<Cheque>();
  @Output() eventEdit = new EventEmitter<Cheque>();
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  enNuevo = false;
  modalTitle: string;
  cheque: Cheque = new Cheque();

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

  nuevoCheque() {
    this.modalTitle = 'Nuevo Cheque';
    this.enNuevo = true;
    this.cheque = new Cheque;
    const today = new Date();
    this.cheque.fecha_ingreso =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    (<any>$('#modalEditar')).modal('show');
    ModalChequeComponent.open();
  }

  editarCheque(chequeAEditar: Cheque) {
    this.modalTitle = 'Editar Cheque';
    this.enNuevo = false;
    this.cheque = JSON.parse(JSON.stringify(chequeAEditar));

    let month, day;

    if (!!this.cheque.fecha_emision) {
      month = this.cheque.fecha_emision.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.cheque.fecha_emision.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.cheque.fecha_emision =  {
        date: {
          year: this.cheque.fecha_emision.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }

    month = this.cheque.fecha_ingreso.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    day = this.cheque.fecha_ingreso.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.cheque.fecha_ingreso =  {
      date: {
        year: this.cheque.fecha_ingreso.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    if (!!this.cheque.fecha_vencimiento) {
      month = this.cheque.fecha_vencimiento.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.cheque.fecha_vencimiento.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.cheque.fecha_vencimiento =  {
        date: {
          year: this.cheque.fecha_vencimiento.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }

    if (!!this.cheque.fecha_cobro) {
      month = this.cheque.fecha_cobro.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.cheque.fecha_cobro.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.cheque.fecha_cobro =  {
        date: {
          year: this.cheque.fecha_cobro.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }
    ModalChequeComponent.open();
  }

  cerrar() {
    this.submitted = false;
    ModalChequeComponent.close();
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.cerrar();

      // Máscara para mostrar siempre 2 decimales
      const num = this.cheque.importe;
      this.cheque.importe = !isNaN(+num) ? (+num).toFixed(2) : num;

      const chequeAEnviar = new Cheque();
      Object.assign(chequeAEnviar, this.cheque);
      if (!!chequeAEnviar.fecha_emision) {
        chequeAEnviar.fecha_emision = HelperService.myDatePickerDateToString(chequeAEnviar.fecha_emision);
      }
      chequeAEnviar.fecha_ingreso = HelperService.myDatePickerDateToString(chequeAEnviar.fecha_ingreso);
      if (!!chequeAEnviar.fecha_vencimiento) {
        chequeAEnviar.fecha_vencimiento = HelperService.myDatePickerDateToString(chequeAEnviar.fecha_vencimiento);
      }
      if (!!chequeAEnviar.fecha_cobro) {
        chequeAEnviar.fecha_cobro = HelperService.myDatePickerDateToString(chequeAEnviar.fecha_cobro);
      }

      if (this.enNuevo) {
        this.enNuevo = false;
        if (this.shouldSendApiRequest) {
          this.apiService.post('chequesterceros', chequeAEnviar).subscribe(
            json => {
              json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
              if (!!json.cliente_id) {
                json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
              }
              this.eventNew.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventNew.emit(chequeAEnviar);
          f.form.reset();
        }

      } else {
        if (this.shouldSendApiRequest) {
          this.apiService.put('chequesterceros/' + chequeAEnviar.id, chequeAEnviar).subscribe(
            json => {
              json.banco_nombre = this.bancos.find(x => x.id === json.banco_id).nombre;
              if (!!json.cliente_id) {
                json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
              }
              this.eventEdit.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventEdit.emit(chequeAEnviar);
          f.form.reset();
        }
      }
    }
  }
}
