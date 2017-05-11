import { Item } from 'domain/item';

export class Comprobante {
  id: number;
  cliente_id: number;
  tipo_comprobante_id: number;
  fecha: Date | string;
  punto_venta: number;
  numero: number;
  cliente_nombre: string;
  cliente_tipo_resp: string;
  cliente_cuit: string;
  importe_neto: number;
  alicuota_iva: number;
  importe_iva: number;
  importe_total: number;
  saldo: number;
  cae: string;
  fecha_cae: Date;
  fecha_venc_cae: Date;
  anulado: Boolean;
  items: Item[];
}
