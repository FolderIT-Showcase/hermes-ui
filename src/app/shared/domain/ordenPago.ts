import {TipoComprobante} from './tipocomprobante';
import {ItemOrdenPago} from './itemOrdenPago';

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
  tipo_comprobante: TipoComprobante;
  importe_total;
  importe_neto;
  importe_iva;
}
