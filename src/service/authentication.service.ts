import {EventEmitter, Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {ApiService} from './api.service';
import {User} from '../domain/user';
import {isNullOrUndefined} from 'util';
import {Parametro} from '../domain/parametro';

@Injectable()
export class AuthenticationService {
  public currentUser$: EventEmitter<User>;
  private currentUser: User;
  private currentParameters$: EventEmitter<Parametro[]>;
  private currentParameters: Parametro[];

  constructor(private api: ApiService) {
    this.currentUser$ = new EventEmitter();
    this.currentParameters$ = new EventEmitter();
  }

  login(user: User) {
    return this.api.loginPost('login', user)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        if (user && response.json()['token']) {
          user = response.json()['user'];
          user.token = response.json()['token'];
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.api.useJwt();
          this.currentUser$.emit(user);
          this.currentUser = user;

          this.api.get('parametros').subscribe( json => {
            this.currentParameters = json;
            this.currentParameters$.emit(json);
            localStorage.setItem('currentParameters', json);
          });
        }
      }).first().toPromise();
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUser$.emit(null);
    this.currentUser = null;

    // remove parameters from local storage
    localStorage.removeItem('currentParameters');
    this.currentParameters$.emit(null);
    this.currentParameters = null;
  }

  getCurrentUser() {
    if (isNullOrUndefined(this.currentUser)) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    return this.currentUser;
  }

  getCurrentParameters() {
    if (isNullOrUndefined(this.currentParameters)) {
      this.currentParameters = JSON.parse(localStorage.getItem('currentParameters'));
    }
    return this.currentParameters;
  }
}
