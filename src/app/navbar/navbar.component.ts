import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../service/authentication.service';
import {User} from '../../domain/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private usuarioLogeado: User = null;

  constructor(private router: Router, private authenticationService: AuthenticationService) {
    authenticationService.currentUser$.subscribe(user => this.onCurrentUserChanged(user));
  }

  ngOnInit() {
    this.usuarioLogeado = this.authenticationService.getCurrentUser();
  }

  private onCurrentUserChanged(user: User) {
    this.usuarioLogeado = user;
  }

  private salir() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
