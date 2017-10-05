import {Component, OnInit} from '@angular/core';
import {User} from '../shared/domain/user';
import {AuthenticationService} from '../shared/services/authentication.service';
import {TitleService} from '../shared/services/title.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentUser: User;

  constructor(private authenticationService: AuthenticationService,
              private titleService: TitleService) {
    this.currentUser = this.authenticationService.getCurrentUser();
  }

  ngOnInit() {
    this.titleService.setTitle('Inicio');
  }

}
