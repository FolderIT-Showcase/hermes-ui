import {MaxLength, Required} from '../service/annotations';

export class Banco {
  id: number;
  @Required @MaxLength(50) nombre: string;
}


