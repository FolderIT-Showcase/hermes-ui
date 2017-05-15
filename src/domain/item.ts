export class Item {
  id: number;
  nombre: string;
  comprobante_id: number;
  articulo_id: number;
  cantidad: number | string = '';
  importe_unitario: number | string = '';
  costo_unitario = 0;
  importe_total = 0;
  importe_neto  = 0;
  alicuota_iva = 0;
  importe_iva = 0;
}
