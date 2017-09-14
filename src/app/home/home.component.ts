import {Component, OnInit} from '@angular/core';
import {User} from '../shared/domain/user';
import {AuthenticationService} from '../shared/services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentUser: User;

  constructor(private authenticationService: AuthenticationService) {
    this.currentUser = this.authenticationService.getCurrentUser();
  }

  ngOnInit() {
  }

}
