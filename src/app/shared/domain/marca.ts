import {Async, MaxLength, Required} from '../services/annotations';

export class Marca {
  id: number;
  @Required @MaxLength(191) nombre: string;
  @Required @Async('marcas') @MaxLength(20) codigo: string;
}