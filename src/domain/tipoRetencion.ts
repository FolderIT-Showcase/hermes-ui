import {Decimal, Max, MaxLength, Min, Required} from '../service/annotations';

export class TipoRetencion {
  id: number;
  @Required @MaxLength(191) nombre: string;
  @Required @Min(0) @Max(100) @Decimal(7, 2) alicuota: number;
}
