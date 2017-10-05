import {ComprobanteCompra} from './comprobanteCompra';

export class ItemOrdenPago {
  id: number;
  orden_pago_id: number;
  comprobante_compra_id: number;
  descripcion: string;
  importe: string | number;
  descuento: number | string;
  porcentaje_descuento: number | string;
  importe_total: number | string;
  comprobante_compra: ComprobanteCompra;
  ptoventaynumero: string;
  tipoPtoVtaYNumero: string;
  anticipo: boolean;
}
