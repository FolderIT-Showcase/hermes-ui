import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {AlertService} from '../../service/alert.service';
import {NavbarTitleService} from '../../service/navbar-title.service';
import {User} from '../../domain/user';
import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;
  mostrarCodigo = true;
  submitted1 = false;
  mostrarRecuperar = false;
  submitted2 = false;
  passwordNoCoincide = false;

  constructor(private router: Router,
              private apiService: ApiService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {
  }

  ngOnInit() {
    // reset login status
    this.navbarTitleService.setTitle('');
  }

  enviarCodigo(f1: HTMLFormElement) {
    this.submitted1 = true;
    if (f1.valid) {
      this.apiService.post('password/forgot', {'email': this.model.email}).subscribe( res => {
        this.mostrarCodigo = false;
        this.mostrarRecuperar = true;
      }, error => {
        this.mostrarErrores(error);
      });
    }
  }

  private mostrarErrores(error) {
    let msg = '';
    for (const key in error.json()['error']) {
      if (Object.prototype.hasOwnProperty.call(error.json()['error'], key)) {
        msg += ' ' + error.json()['error'][key];
      }
    }
    this.alertService.error(msg);
  }

  reestablecer(f2: HTMLFormElement) {
    this.submitted2 = true;
    if (f2.valid && !this.passwordNoCoincide) {
      this.apiService.post('password/reset', this.model).subscribe( res => {
        this.router.navigate(['/login']);
        this.alertService.success('Se ha restablecido exitosamente la contraseña');
      }, error => {
        this.alertService.error(error.json()['error']);
      });
    }
  }

  onPasswordChange(event) {
    this.model.password = event;
    this.passwordNoCoincide = this.model.password !== this.model.repassword;
  }

  onRepasswordChange(event) {
    this.model.repassword = event;
    this.passwordNoCoincide = this.model.password !== this.model.repassword;
  }
}
