import {MaxLength, Required} from '../service/annotations';

export class Zona {
  id: number;
  @Required @MaxLength(191) nombre: string;
}
