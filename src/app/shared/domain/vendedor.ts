import {Decimal, MaxLength, Min, References, Required} from '../services/annotations';

export class Vendedor {
  id: number;
  @Required @MaxLength(191) nombre: string;
  @Required @References('zonas') zona_id: Number;
  @Required @Decimal(7, 2) @Min(0) comision: Number | string;
  zona_nombre: String;
}
