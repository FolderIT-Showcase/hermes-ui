import {Async, MaxLength, References, Required} from '../service/annotations';

export class Subrubro {
  id: number;
  @Required @References('rubros') rubro_id: number;
  @Required @MaxLength(191) nombre: string;
  @Required @Async('subrubros') @MaxLength(20) codigo: string;
  rubro_nombre: string;
}
