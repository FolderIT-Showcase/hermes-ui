import {MaxLength, Required} from '../services/annotations';

export class Banco {
  id: number;
  @Required @MaxLength(50) nombre: string;
}
