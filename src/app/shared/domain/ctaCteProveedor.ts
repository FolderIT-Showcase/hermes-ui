import {TipoComprobanteCompra} from './tipoComprobanteCompra';
import {ComprobanteCompra} from './comprobanteCompra';
import {OrdenPago} from './ordenPago';
export class CtaCteProveedor {
  id: number;
  proveedor_id: number;
  tipo_comp_compras_id: number;
  tipo_comp_compras: TipoComprobanteCompra;
  comprobante_compras_id: number;
  comprobante_compras: ComprobanteCompra;
  orden_pago_id: number;
  orden_pago: OrdenPago;
  fecha: Date;
  descripcion: String;
  debe: number;
  haber: number;
  saldo: number | string;
  ptoventaynumero: string;
}
