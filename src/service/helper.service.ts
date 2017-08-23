import { Injectable } from '@angular/core';
import {AbstractControl, FormControl, ValidatorFn} from '@angular/forms';

@Injectable()
export class HelperService {

  static defaultDatePickerOptions() {
    return {
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

  static rangoFechaInvalido(inicio, fin): boolean {
    return (inicio.date.year > fin.date.year)
    ||  ((inicio.date.year === fin.date.year) &&
      (inicio.date.month > fin.date.month))
    || ((inicio.date.year === fin.date.year) &&
      (inicio.date.month === fin.date.month)
      && inicio.date.day > fin.date.day);
  }

  static myDatePickerDateToString(fecha: any) {
    return fecha.date.year + '-' + fecha.date.month + '-' + fecha.date.day;
  }

  static defaultDataTablesLanguage() {
    return {
      'processing':     'Procesando...',
      'lengthMenu':     'Mostrar _MENU_ registros',
      'zeroRecords':    'No se encontraron resultados',
      'emptyTable':     'Ningún dato disponible en esta tabla',
      'info':           'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
      'infoEmpty':      'Mostrando registros del 0 al 0 de un total de 0 registros',
      'infoFiltered':   '(filtrado de un total de _MAX_ registros)',
      'infoPostFix':    '',
      'search':         'Buscar:',
      'url':            '',
      // 'infoThousands':  ',',
      'loadingRecords': 'Cargando...',
      'paginate': {
        'first':    'Primero',
        'last':     'Último',
        'next':     'Siguiente',
        'previous': 'Anterior'
      },
      'aria': {
        'sortAscending':  ': Activar para ordenar la columna de manera ascendente',
        'sortDescending': ': Activar para ordenar la columna de manera descendente'
      }
    };
  }

  static decimalPlacesValidator(max_places: number): ValidatorFn  {
    return function (c: AbstractControl) {
      const decimal_places = ((+c.value).toFixed(20)).replace(/^-?\d*\.?|0+$/g, '').length;
      if (decimal_places > max_places) {
        return {
          decimalPlaces: {
            decimalPlaces: max_places,
            currentdecimalPlaces: decimal_places
          }
        };
      } else {
        return null;
      }
    };
  }

  constructor() { }
}
