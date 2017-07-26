import {TipoComprobanteCompra} from './tipoComprobanteCompra';
import {ComprobanteCompra} from './comprobanteCompra';
export class CtaCteProveedor {
  id: number;
  proveedor_id: number;
  tipo_comp_compras_id: number;
  tipo_comp_compras: TipoComprobanteCompra;
  comprobante_compras_id: number;
  comprobante_compras: ComprobanteCompra;
  fecha: Date;
  descripcion: String;
  debe: number;
  haber: number;
  saldo: number | string;
}
