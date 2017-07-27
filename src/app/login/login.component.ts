import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {AlertService} from 'service/alert.service';
import {User} from '../../domain/user';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private navbarTitleService: NavbarTitleService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
    this.navbarTitleService.setTitle('');
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
