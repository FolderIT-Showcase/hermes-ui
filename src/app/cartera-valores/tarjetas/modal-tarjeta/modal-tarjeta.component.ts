import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Tarjeta} from '../../../../domain/tarjeta';
import {Cliente} from '../../../../domain/cliente';
import {TipoTarjeta} from '../../../../domain/tipoTarjeta';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../../service/api.service';

@Component({
  selector: 'app-modal-tarjeta',
  templateUrl: './modal-tarjeta.component.html',
  styleUrls: ['./modal-tarjeta.component.css']
})
export class ModalTarjetaComponent implements OnInit {
  @Input() clientes: Cliente[];
  @Input() tipos: TipoTarjeta[];
  @Output() eventNew = new EventEmitter<Tarjeta>();
  @Output() eventEdit = new EventEmitter<Tarjeta>();
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  enNuevo = false;
  modalTitle: string;
  tarjeta: Tarjeta = new Tarjeta();

  static open() {
    (<any>$('#modalEditar')).modal('show');
  }

  static close() {
    (<any>$('#modalEditar')).modal('hide');
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
      dayLabels: {su: 'Dom', mo: 'Lun', tu: 'Mar', we: 'Mié', th: 'Jue', fr: 'Vie', sa: 'Sáb'},
      monthLabels: {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
        7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'},
      todayBtnTxt: 'Hoy',
      showClearDateBtn: false,
      editableDateField: false,
      openSelectorOnInputClick: true,
      alignSelectorRight: true,
    };
  }

  nuevaTarjeta() {
    this.submitted = false;
    this.enNuevo = true;
    this.modalTitle = 'Nueva Tarjeta';
    this.tarjeta = new Tarjeta;
    const today = new Date();
    this.tarjeta.fecha_ingreso =  { date: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}};
    ModalTarjetaComponent.open();
  }

  editarTarjeta(tarjetaAEditar: Tarjeta) {
    this.submitted = false;
    this.modalTitle = 'Editar Tarjeta';
    this.enNuevo = false;
    this.tarjeta = JSON.parse(JSON.stringify(tarjetaAEditar));
    let month = this.tarjeta.fecha_ingreso.toString().split('-')[1];
    if (month[0] === '0') {
      month = month.slice(1, 2);
    }
    let day = this.tarjeta.fecha_ingreso.toString().split('-')[2];
    if (day[0] === '0') {
      day = day.slice(1, 2);
    }
    this.tarjeta.fecha_ingreso =  {
      date: {
        year: this.tarjeta.fecha_ingreso.toString().slice(0, 4),
        month: month,
        day: day
      }
    };

    if (!!this.tarjeta.fecha_acreditacion) {
      month = this.tarjeta.fecha_acreditacion.toString().split('-')[1];
      if (month[0] === '0') {
        month = month.slice(1, 2);
      }
      day = this.tarjeta.fecha_acreditacion.toString().split('-')[2];
      if (day[0] === '0') {
        day = day.slice(1, 2);
      }
      this.tarjeta.fecha_acreditacion =  {
        date: {
          year: this.tarjeta.fecha_acreditacion.toString().slice(0, 4),
          month: month,
          day: day
        }
      };
    }
    ModalTarjetaComponent.open();
  }

  private cerrar() {
    this.submitted = false;
    ModalTarjetaComponent.close();
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.cerrar();

      // Máscara para mostrar siempre 2 decimales
      const num = this.tarjeta.importe;
      this.tarjeta.importe = !isNaN(+num) ? (+num).toFixed(2) : num;

      const tarjetaAEnviar = new Tarjeta();
      Object.assign(tarjetaAEnviar, this.tarjeta);
      tarjetaAEnviar.fecha_ingreso = tarjetaAEnviar.fecha_ingreso.date.year + '-' + tarjetaAEnviar.fecha_ingreso.date.month + '-' + tarjetaAEnviar.fecha_ingreso.date.day;
      if (!!tarjetaAEnviar.fecha_acreditacion) {
        tarjetaAEnviar.fecha_acreditacion = tarjetaAEnviar.fecha_acreditacion.date.year + '-' + tarjetaAEnviar.fecha_acreditacion.date.month + '-' + tarjetaAEnviar.fecha_acreditacion.date.day;
      }

      if (this.enNuevo) {
        this.enNuevo = false;
        this.apiService.post('tarjetas', tarjetaAEnviar).subscribe(
          json => {
            json.tarjeta_nombre = this.tipos.find(x => x.id === json.tarjeta_id).nombre;
            if (!!json.cliente_id) {
              json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            }
            this.eventNew.emit(json);
            f.form.reset();
          }
        );
      } else {
        this.apiService.put('tarjetas/' + tarjetaAEnviar.id, tarjetaAEnviar).subscribe(
          json => {
            json.tarjeta_nombre = this.tipos.find(x => x.id === json.tarjeta_id).nombre;
            if (!!json.cliente_id) {
              json.cliente_nombre = this.clientes.find(x => x.id === json.cliente_id).nombre;
            }
            this.eventEdit.emit(json);
            f.form.reset();
          }
        );
      }
    }
  }
}
