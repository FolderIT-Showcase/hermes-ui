import {References, Required} from '../services/annotations';

export class ParametroUsuario {
  id: number;
  @Required @References('users') user_id: number;
  punto_venta: number | string;
}
