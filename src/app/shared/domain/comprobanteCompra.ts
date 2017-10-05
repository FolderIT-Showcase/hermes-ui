import {Proveedor} from './proveedor';
import {TipoComprobanteCompra} from './tipoComprobanteCompra';
import {PeriodoFiscal} from './periodoFiscal';
import {ComprobanteCompraImportes} from './comprobanteCompraImportes';
import {ComprobanteCompraRetencion} from './comprobanteCompraRetencion';

export class ComprobanteCompra {
  id: number;
  proveedor_id: number;
  tipo_comp_compras_id: number;
  periodo_id: number;
  fecha: Date | string;
  numero: number;
  proveedor_nombre: string;
  proveedor_tipo_resp: string;
  proveedor_cuit: string;
  importe_total: number;
  saldo: number | string;
  anulado: Boolean;
  punto_venta: number;
  ptoventaynumero: string;
  proveedor: Proveedor;
  periodo: PeriodoFiscal;
  tipo_comp_compras: TipoComprobanteCompra;
  comprobante_compra_importes: ComprobanteCompraImportes;
  comprobante_compra_retenciones: ComprobanteCompraRetencion[];
  en_lista: boolean;
}
