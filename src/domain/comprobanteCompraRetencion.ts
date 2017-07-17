import {TipoRetencion} from './tipoRetencion';
export class ComprobanteCompraRetencion {
  id: number;
  comprobante_id: number;
  retencion_id: number;
  tipoRetencion: TipoRetencion;
  base_imponible = 0;
  alicuota = 0;
  importe = 0;
}
