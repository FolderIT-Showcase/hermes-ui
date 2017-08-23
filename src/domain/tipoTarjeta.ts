import {Enum, MaxLength, Required} from '../service/annotations';

export class TipoTarjeta {
  id: number;
  @Required @MaxLength(50) nombre: string;
  @Required @Enum(['C', 'D'], ['Crédito', 'Débito']) tipo: string;
}
