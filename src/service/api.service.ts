import {Injectable} from '@angular/core';
import {Headers, Http, Response, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import {User} from '../domain/user';
import {Router} from '@angular/router';
import {AlertService} from './alert.service';

@Injectable()
export class ApiService {
  // server URL
  private baseURL = 'http://hermes.api/api/';

  //
  // HEADERS
  //

  private headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  });

  //
  // constructor
  //

  constructor(private http: Http,
              private router: Router,
              private alertService: AlertService) {
  }

  private getJson(response: Response) {
    if (response.status === 204) {
      return '';
    }
    return response.json();
  }

  useJwt() {
    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    this.headers.set('Authorization', user.token);
  }

  private checkForError(response: Response): Response | Observable<any> {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    error['response'] = response;
    throw error;
  }

  public get(path: string): Observable<any> {
    this.useJwt();
    return this.http.get(`${this.baseURL}${path}`, {headers: this.headers})
      .map(this.checkForError)
      .catch( err => {
        if (err.status === 401) {
          this.alertService.error('La sesión ha expirado', true);
          this.router.navigate(['/login']);
        }
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  public post(path: string, body): Observable<any> {
    return this.http
      .post(
        `${this.baseURL}${path}`, JSON.stringify(body),
        {headers: this.headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  public put(path: string, body): Observable<any> {
    return this.http
      .put(
        `${this.baseURL}${path}`, JSON.stringify(body),
        {headers: this.headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  public delete(path): Observable<any> {
    this.useJwt();
    return this.http.delete(`${this.baseURL}${path}`, {headers: this.headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  public loginPost(path: string, body): Observable<any> {
    return this.http
      .post(
        `${this.baseURL}${path}`, JSON.stringify(body),
        {headers: this.headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err));
  }

  public postWithFile(path: string, body,  file: File): Observable<any> {
    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    const headers = new Headers({
      'Accept': 'application/json',
      'Authorization':  user.token
    });
    const  formData: FormData = new FormData();
    formData.append('file', file, file.name);

    if (body !== '' && body !== undefined && body !== null) {
      for (const property in body) {
        if (body.hasOwnProperty(property)) {
          formData.append(property, body[property]);
        }
      }
    }

    return this.http
      .post(
        `${this.baseURL}${path}`, formData,
        {headers: headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  public downloadPDF(path: string, body): Observable<any> {
    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    const headers = new Headers({
      'Accept': 'application/pdf',
      'Authorization':  user.token,
    });
    return this.http
      .post(
        `${this.baseURL}${path}`, JSON.stringify(body),
        {headers: headers, responseType: ResponseContentType.Blob})
      .map(
        (res) => {
          return new Blob([res.blob()], { type: 'application/pdf' });
        });
  }
}
