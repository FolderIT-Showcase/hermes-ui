import {TipoComprobante} from './tipocomprobante';
import {ItemOrdenPago} from './itemOrdenPago';
import {TipoComprobanteCompra} from './tipoComprobanteCompra';

export class OrdenPago {
  id: number;
  proveedor_id: number;
  fecha: Date | string;
  punto_venta: number | string;
  numero: number | string;
  importe: number | string;
  importe_sub: number | string;
  descuentos: number | string;
  items: ItemOrdenPago[];
  orden_pago_items: ItemOrdenPago[];
  orden_pago_valores: any;
  ptoventaynumero: string;
  proveedor_nombre: string;
  tipo_comp_compras: TipoComprobanteCompra;
  importe_total;
  importe_neto;
  importe_iva;
  proveedor_tipo_resp;
}
