import {TipoComprobante} from './tipocomprobante';
import {Comprobante} from './comprobante';
export class CtaCteCliente {
  id: number;
  cliente_id: number;
  tipo_comprobante_id: number;
  tipo_comprobante: TipoComprobante;
  comprobante_id: number;
  comprobante: Comprobante;
  fecha: Date;
  descripcion: String;
  debe: number;
  haber: number;
  saldo: number | string;
}
