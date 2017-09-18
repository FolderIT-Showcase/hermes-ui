import {MaxLength, Required} from '../services/annotations';

export class Zona {
  id: number;
  @Required @MaxLength(191) nombre: string;
}
