import {Injectable} from '@angular/core';

import {User} from '../domain/user';
import {ApiService} from './api.service';
import {ParametroUsuario} from '../domain/parametroUsuario';

@Injectable()
export class UserService {
  constructor(private api: ApiService) {
  }

  getAll() {
    return this.api.get('usuarios');
  }

  getById(id: number) {
    return this.api.get('usuarios/' + id);
  }

  create(user: User) {
    return this.api.post('usuarios', user);
  }

  update(user: User) {
    return this.api.put('usuarios/' + user.id, user);
  }

  delete(id: number) {
    return this.api.delete('usuarios/' + id);
  }

  getParametros(id: number) {
    return this.api.get('usuarios/' + id + '/parametros');
  }

  updateParametros(parametroUsuario: ParametroUsuario) {
    return this.api.put('usuarios/' + parametroUsuario.user_id + '/parametros', parametroUsuario);
  }
}
