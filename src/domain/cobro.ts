import {ItemCobro} from './itemCobro';

export class Cobro {
  id: number;
  cliente_id: number;
  fecha: Date | string;
  punto_venta: number | string;
  numero: number | string;
  importe: number | string;
  importe_sub: number | string;
  descuentos: number | string;
  items: ItemCobro[];
  cobro_valores: any;
  ptoventaynumero: string;
  cliente_nombre: string;
}
