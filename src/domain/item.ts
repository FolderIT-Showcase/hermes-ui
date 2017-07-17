import {Articulo} from './articulo';
export class Item {
  id: number;
  codigo: string;
  nombre: string;
  comprobante_id: number;
  articulo_id: number;
  cantidad: number | string = 1;
  importe_unitario: number | string = '0.00';
  porcentaje_descuento: number | string = '0.00';
  importe_descuento: number | string = '0.00';
  costo_unitario = 0;
  importe_total: number | string = '0.00';
  importe_neto: number | string = '0.00';
  alicuota_iva = 0;
  importe_iva = 0;
  articulo: Articulo;
}
