import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../../service/user.service';
import {AlertService} from '../../service/alert.service';
import {User} from '../../domain/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  model: any = {};
  loading = false;

  constructor(private router: Router,
              private userService: UserService,
              private alertService: AlertService) {
  }

  register() {
    this.loading = true;
    const user = new User();
    user.email = this.model.email;
    user.password = this.model.password;
    user.name = this.model.firstName + ' ' + this.model.lastName;
    this.userService.create(user)
      .subscribe(
        data => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        },
        error => {
          let mensaje = '';
          const json = error.json()['error'];
          for (const key in json) {
            if (json.hasOwnProperty(key)) {
              console.log(key + ' -> ' + json[key]);
              mensaje = mensaje === '' ? json[key] : mensaje + '\n' + json[key];
            }
          }

          this.alertService.error(mensaje);
          this.loading = false;
        }
      );
  }
}
