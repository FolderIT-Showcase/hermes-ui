import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../service/authentication.service';
import {User} from '../domain/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app works!';

  mostrarBarraLateral = false;

  constructor(private authenticationService: AuthenticationService) {
    authenticationService.currentUser$.subscribe(user => this.onCurrentUserChanged(user));
  }

  ngOnInit() {
    this.mostrarBarraLateral = !!this.authenticationService.getCurrentUser();
  }

  private onCurrentUserChanged(user: User) {
    this.mostrarBarraLateral = !!user;
  }
}
