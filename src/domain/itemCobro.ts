import {Comprobante} from './comprobante';

export class ItemCobro {
  id: number;
  cobro_id: number;
  comprobante_id: number;
  descripcion: string;
  importe: string | number;
  descuento: number | string;
  porcentaje_descuento: number | string;
  importe_total: number | string;
  comprobante: Comprobante;
  ptoventaynumero: string;
  tipoPtoVtaYNumero: string;
  anticipo: boolean;
}
