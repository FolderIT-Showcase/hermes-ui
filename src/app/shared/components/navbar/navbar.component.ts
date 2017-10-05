import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {User} from '../../domain/user';
import {Router} from '@angular/router';
import {TitleService} from '../../services/title.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  usuarioLogeado: User = null;
  titulo_navbar: String = '';

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private titleService: TitleService) {
    authenticationService.currentUser$.subscribe(user => this.onCurrentUserChanged(user));
    titleService.title$.subscribe( title => this.onTitleChanged(title));
  }

  ngOnInit() {
    this.usuarioLogeado = this.authenticationService.getCurrentUser();
    this.titulo_navbar = this.titleService.getTitle();
  }

  private onCurrentUserChanged(user: User) {
    this.usuarioLogeado = user;
  }
  private onTitleChanged(title: String) {
    this.titulo_navbar = title;
  }

  salir() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
