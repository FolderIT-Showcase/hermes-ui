import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {AlertService} from 'service/alert.service';
import {User} from '../../domain/user';

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
              private alertService: AlertService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  onSubmit() {
    this.loading = true;
    const user = new User();
    user.name = this.model.name;
    user.password = this.model.password;
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
