import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../service/api.service';
import {Cliente} from '../../domain/cliente';
import {Banco} from '../../domain/banco';

@Component({
  selector: 'app-cartera-valores',
  templateUrl: './cartera-valores.component.html',
  styleUrls: ['./cartera-valores.component.css']
})
export class CarteraValoresComponent implements OnInit {
  medioPago = 0;
  mostrarTarjetas = false;
  mostrarCheques = false;
  mostrarDepositos = false;
  myDatePickerOptions: IMyDpOptions;
  filtrarFechaIngreso = false;
  filtrarNumero = false;
  fechaIngresoInicio: any;
  fechaIngresoFin: any;
  bancos: Banco[] = [];
  clientes: Cliente[] = [];
  estado = '0';
  cliente = 0;
  banco = 0;
  numero = '';
  filter: any;

  constructor(private apiService: ApiService,
              private navbarTitleService: NavbarTitleService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.navbarTitleService.setTitle('Cartera de Valores');

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
    };
    this.cargarClientes();
    this.cargarBancos();
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.fechaIngresoInicio = { date: { year: firstDay.getFullYear(), month: firstDay.getMonth() + 1, day: firstDay.getDate() }};
    this.fechaIngresoFin =  { date: { year: lastDay.getFullYear(), month: lastDay.getMonth() + 1, day: lastDay.getDate() }};
  }

  filtrar() {
    this.mostrarTarjetas = false;
    this.mostrarDepositos = false;
    this.mostrarCheques = false;
    this.cdRef.detectChanges();

    if ((this.filtrarFechaIngreso && !this.rangoFechaInvalido()) || !this.filtrarFechaIngreso) {
      this.filter = {};
      if (this.estado !== '0') {
        this.filter.estado = this.estado;
      }

      this.filter.cliente = this.cliente;
      this.filter.banco = this.banco;

      if (this.filtrarNumero) {
        this.filter.numero = this.numero;
      }

      if (this.filtrarFechaIngreso) {
        this.filter.fecha_ingreso_inicio = this.fechaIngresoInicio.date.year + '-'
          + this.fechaIngresoInicio.date.month
          + '-' + this.fechaIngresoInicio.date.day;
        this.filter.fecha_ingreso_fin = this.fechaIngresoFin.date.year + '-' + this.fechaIngresoFin.date.month + '-' + this.fechaIngresoFin.date.day;
      }

      switch (this.medioPago) {
        case 0:
          this.mostrarCheques = true;
          break;
        case 1:
          this.mostrarDepositos = true;
          break;
        case 2:
          this.mostrarTarjetas = true;
          break;
      }
    }

  }

  cargarClientes() {
    if (this.clientes.length === 0) {
      this.apiService.get('clientes').subscribe(
        json => {
          this.clientes = json;
        }
      );
    }
  }

  cargarBancos() {
    if (this.bancos.length === 0) {
      this.apiService.get('bancos').subscribe(
        json => {
          this.bancos = json;
        }
      );
    }
  }

  rangoFechaInvalido(): boolean {
    return (this.fechaIngresoInicio.date.year > this.fechaIngresoFin.date.year)
      ||  ((this.fechaIngresoInicio.date.year === this.fechaIngresoFin.date.year) &&
        (this.fechaIngresoInicio.date.month > this.fechaIngresoFin.date.month))
      || ((this.fechaIngresoInicio.date.year === this.fechaIngresoFin.date.year) &&
        (this.fechaIngresoInicio.date.month === this.fechaIngresoFin.date.month)
        && this.fechaIngresoInicio.date.day > this.fechaIngresoFin.date.day);
  }
}
