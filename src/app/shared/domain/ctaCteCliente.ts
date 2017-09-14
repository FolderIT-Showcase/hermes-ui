import {TipoComprobante} from './tipocomprobante';
import {Comprobante} from './comprobante';
import {Cobro} from './cobro';
export class CtaCteCliente {
  id: number;
  cliente_id: number;
  tipo_comprobante_id: number;
  tipo_comprobante: TipoComprobante;
  comprobante_id: number;
  cobro_id: number;
  comprobante: Comprobante;
  cobro: Cobro;
  fecha: Date;
  descripcion: String;
  debe: number;
  haber: number;
  saldo: number | string;
  ptoventaynumero: string;
}
