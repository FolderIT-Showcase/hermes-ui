import {Async, MaxLength, Required} from '../services/annotations';

export class Rubro {
  id: number;
  @Required @MaxLength(191) nombre: string;
  @Required @Async('rubros') @MaxLength(20) codigo: string;
}