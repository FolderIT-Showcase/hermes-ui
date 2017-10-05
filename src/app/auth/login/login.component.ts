import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../shared/services/authentication.service';
import {AlertService} from '../../shared/services/alert.service';
import {User} from '../../shared/domain/user';
import {TitleService} from '../../shared/services/title.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private titleService: TitleService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
    this.titleService.setTitle('Iniciar Sesión');

    // fix modales bloqueantes al volver ser routeado a login
    (<any>$('.modal-backdrop')).remove();
  }

  onSubmit() {
    this.loading = true;
    const user = new User();
    user.username = this.model.username;
    user.password = this.model.password;
    user.tenant = this.model.tenant;
    this.authenticationService.login(user)
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch(error => {
        this.alertService.error(error.json()['error']);
        this.loading = false;
      });
  }
}
