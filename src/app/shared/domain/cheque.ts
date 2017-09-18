export class Cheque {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  banco_id: number;
  banco_nombre: string;
  sucursal: string;
  numero: string;
  nro_interno: string;
  importe: string | number;
  fecha_emision: any;
  fecha_ingreso: any;
  fecha_vencimiento: any;
  fecha_cobro: any;
  origen: string;
  destinatario: string;
  estado: string;
  descripcion: string;
}
