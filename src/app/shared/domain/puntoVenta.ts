import {Async, Decimal, Enum, MaxLength, Min, Required} from '../services/annotations';

export class PuntoVenta {
  @Required @Async('puntosventa') @Decimal(4, 0) @Min(0) id: number | string;
  @Required @Enum(['IMP', 'IF', 'FE'], ['Impresión Común', 'Impresora Fiscal', 'Facturación Electrónica']) tipo_impresion: string;
  habilitado: Boolean = true;
  @MaxLength(191) descripcion: string;
}
