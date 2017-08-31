import {Enum, MaxLength, References, Required} from '../service/annotations';

export class CuentaBancaria {
  id: number;
  @Required @References('bancos') banco_id: number;
  @Required @MaxLength(50) numero: string;
  @Required @Enum(['Cuenta Corriente', 'Caja Ahorro'], ['Cuenta Corriente', 'Caja Ahorro']) tipo: string;
  banco_nombre: string;
}
