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
  importe_neto: number | string = 0;
  alicuota_iva: number;
  importe_iva: number | string = 0;
  importe_total: string | number = '';
  saldo: number;
  cae: string;
  fecha_cae: Date;
  fecha_venc_cae: Date;
  anulado: Boolean;
  items: Item[];
  lista_id: number;
}
